import { createClient } from "@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function sendJson(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.send(JSON.stringify(payload));
}

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }
  return authorizationHeader.slice("Bearer ".length).trim();
}

function buildContextText({ cityHall, services, providers, requests }) {
  const cityHallLine = cityHall
    ? `Primaria curenta: ${cityHall.name} (${cityHall.locality || "fara localitate"}).`
    : "Nu exista profil de primarie pentru utilizator.";

  const servicesText = (services || [])
    .slice(0, 50)
    .map((s) => `- ${s.name} | categorie: ${s.category || "n/a"} | provider_id: ${s.provider_id || "n/a"}`)
    .join("\n");

  const providersText = (providers || [])
    .slice(0, 50)
    .map((p) => `- ${p.name} | CUI: ${p.tax_id || "n/a"} | activ: ${p.is_active ? "da" : "nu"}`)
    .join("\n");

  const requestsText = (requests || [])
    .slice(0, 100)
    .map((r) => `- ${r.title} | status: ${r.status} | serviciu: ${r.service_name || "n/a"} | furnizor: ${r.provider_name || "n/a"}`)
    .join("\n");

  return [
    cityHallLine,
    "",
    "Servicii disponibile:",
    servicesText || "- niciun serviciu",
    "",
    "Furnizori disponibili:",
    providersText || "- niciun furnizor",
    "",
    "Cererile utilizatorului:",
    requestsText || "- nicio cerere",
  ].join("\n");
}

async function readUserDbContext({ supabaseUrl, supabaseAnonKey, userJwt }) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userJwt}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizator neautentificat");
  }

  const { data: cityHall } = await supabase
    .from("city_halls")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: services } = await supabase
    .from("services")
    .select("id,name,category,provider_id")
    .eq("is_active", true)
    .order("name", { ascending: true });

  const { data: providers } = await supabase
    .from("service_providers")
    .select("id,name,tax_id,is_active")
    .order("name", { ascending: true });

  let requests = [];
  if (cityHall?.id) {
    const { data } = await supabase
      .from("requests")
      .select("id,title,status,service_name,provider_name,created_at")
      .eq("city_hall_id", cityHall.id)
      .order("created_at", { ascending: false })
      .limit(100);
    requests = data || [];
  }

  return {
    user,
    cityHall,
    services: services || [],
    providers: providers || [],
    requests,
  };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const apiKey = process.env.CHAT_API_KEY;
    const endpoint = process.env.CHAT_API_ENDPOINT || "https://api.openai.com/v1/chat/completions";
    const model = process.env.CHAT_MODEL || "gpt-4o-mini";

    if (!supabaseUrl || !supabaseAnonKey || !apiKey) {
      sendJson(res, 500, { error: "Configuratie lipsa pentru chatbot" });
      return;
    }

    const token = extractBearerToken(req.headers.authorization || req.headers.Authorization);
    if (!token) {
      sendJson(res, 401, { error: "Lipseste token-ul de autentificare" });
      return;
    }

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      sendJson(res, 400, { error: "Mesaj invalid" });
      return;
    }

    const context = await readUserDbContext({
      supabaseUrl,
      supabaseAnonKey,
      userJwt: token,
    });

    const dbContextText = buildContextText(context);

    const aiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Esti un asistent pentru platforma Smart City. Raspunzi strict pe baza contextului din baza de date primit in prompt. Daca informatia nu exista in context, spune clar ca nu exista in baza de date si cere detalii suplimentare. Nu inventa date.",
          },
          {
            role: "user",
            content: `Context DB:\n${dbContextText}\n\nIntrebarea utilizatorului:\n${message}`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      sendJson(res, 502, { error: "Eroare API chatbot", details: errorText });
      return;
    }

    const aiJson = await aiRes.json();
    const answer = aiJson?.choices?.[0]?.message?.content?.trim();

    sendJson(res, 200, {
      answer: answer || "Nu am putut genera un raspuns.",
      contextCounts: {
        services: context.services.length,
        providers: context.providers.length,
        requests: context.requests.length,
      },
    });
    return;
  } catch (error) {
    sendJson(res, 500, { error: error?.message || "Eroare interna server" });
  }
}
