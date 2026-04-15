import React, { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Salut! Sunt chatbot-ul Smart City. Iti raspund doar pe baza datelor existente in baza de date.",
    },
  ]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Nu esti autentificat.");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Eroare la chatbot");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "Nu am gasit raspuns." },
      ]);
    } catch (error) {
      toast.error(error.message || "Eroare la trimiterea mesajului");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "A aparut o eroare la procesare. Verifica configurarea endpoint-ului si cheia API.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">Chatbot DB</h1>
        <p className="text-lg text-slate-500 font-extralight mt-1">
          Raspunsurile se bazeaza doar pe datele existente in Supabase.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-[65vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-full bg-baby-light/40 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-baby-dark" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-lg whitespace-pre-wrap ${
                    isUser
                      ? "bg-baby-dark text-white"
                      : "bg-slate-100 text-slate-800 font-extralight"
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Intreaba despre servicii, furnizori sau cererile tale..."
              className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-lg font-extralight text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all"
            />
            <Button onClick={sendMessage} disabled={loading} icon={Send}>
              {loading ? "Se trimite..." : "Trimite"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
