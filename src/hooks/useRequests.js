import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";

export function useRequests() {
  const { cityHall } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!cityHall) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("city_hall_id", cityHall.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        toast.error("Eroare la incarcarea cererilor");
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [cityHall]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!cityHall) return;

    const channel = supabase
      .channel("requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
          filter: `city_hall_id=eq.${cityHall.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setRequests((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id ? payload.new : req
              )
            );
          } else if (payload.eventType === "DELETE") {
            setRequests((prev) =>
              prev.filter((req) => req.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cityHall]);

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;

    const lowerSearch = searchTerm.toLowerCase();
    return requests.filter(
      (req) =>
        req.service_name?.toLowerCase().includes(lowerSearch) ||
        req.provider_name?.toLowerCase().includes(lowerSearch) ||
        req.title?.toLowerCase().includes(lowerSearch)
    );
  }, [requests, searchTerm]);

  const createRequest = useCallback(
    async (requestData) => {
      if (!cityHall) {
        toast.error("Profilul primariei nu este configurat");
        return { data: null, error: new Error("No city hall profile") };
      }

      try {
        const newRequest = {
          city_hall_id: cityHall.id,
          city_hall_name: cityHall.name,
          city_hall_tax_id: cityHall.tax_id,
          contact_person_name: cityHall.contact_person_name,
          contact_person_email: cityHall.contact_person_email,
          contact_person_phone: cityHall.contact_person_phone,
          locality: cityHall.locality,
          status: "pending",
          request_date: format(new Date(), "yyyy-MM-dd"),
          ...requestData,
        };

        const { data, error } = await supabase
          .from("requests")
          .insert(newRequest)
          .select()
          .single();

        if (error) {
          console.error("Error creating request:", error);
          toast.error("Eroare la crearea cererii");
          return { data: null, error };
        }

        toast.success("Cererea a fost creata cu succes!");
        return { data, error: null };
      } catch (err) {
        console.error("Error:", err);
        toast.error("Eroare la crearea cererii");
        return { data: null, error: err };
      }
    },
    [cityHall]
  );

  const updateRequest = useCallback(
    async (id, updateData) => {
      try {
        const { data, error } = await supabase
          .from("requests")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating request:", error);
          toast.error("Eroare la actualizarea cererii");
          return { data: null, error };
        }

        toast.success("Cererea a fost actualizata!");
        return { data, error: null };
      } catch (err) {
        console.error("Error:", err);
        toast.error("Eroare la actualizarea cererii");
        return { data: null, error: err };
      }
    },
    []
  );

  const deleteRequest = useCallback(
    async (id) => {
      try {
        const { error } = await supabase
          .from("requests")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting request:", error);
          toast.error("Eroare la stergerea cererii");
          return { success: false, error };
        }

        toast.success("Cererea a fost stearsa!");
        return { success: true, error: null };
      } catch (err) {
        console.error("Error:", err);
        toast.error("Eroare la stergerea cererii");
        return { success: false, error: err };
      }
    },
    []
  );

  const getRequestById = useCallback(
    (id) => {
      return requests.find((req) => req.id === id);
    },
    [requests]
  );

  const fetchRequestById = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching request:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }, []);

  return {
    requests: filteredRequests,
    loading,
    searchTerm,
    setSearchTerm,
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    fetchRequestById,
    refresh: fetchRequests,
  };
}
