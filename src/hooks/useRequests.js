import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { format } from "date-fns";

export function useRequests() {
  const { cityHall } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchTerm = searchParams.get("q") || "";
  const dateFilter = searchParams.get("date") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const serviceFilter = searchParams.get("service") || "all";

  const updateParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams);
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const setSearchTerm = useCallback(
    (value) => updateParam("q", value?.trim() || ""),
    [updateParam]
  );
  const setDateFilter = useCallback((value) => updateParam("date", value), [updateParam]);
  const setStatusFilter = useCallback((value) => updateParam("status", value), [updateParam]);
  const setServiceFilter = useCallback((value) => updateParam("service", value), [updateParam]);

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
    const lowerSearch = searchTerm.toLowerCase();
    const now = new Date();

    return requests.filter((req) => {
      const searchMatches =
        !searchTerm ||
        req.service_name?.toLowerCase().includes(lowerSearch) ||
        req.provider_name?.toLowerCase().includes(lowerSearch) ||
        req.title?.toLowerCase().includes(lowerSearch);

      const statusMatches =
        statusFilter === "all" || req.status?.toLowerCase() === statusFilter.toLowerCase();

      const serviceMatches =
        serviceFilter === "all" || req.service_name?.toLowerCase() === serviceFilter.toLowerCase();

      let dateMatches = true;
      if (dateFilter !== "all" && req.created_at) {
        const createdAt = new Date(req.created_at);
        if (dateFilter === "day") {
          dateMatches =
            createdAt.getFullYear() === now.getFullYear() &&
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getDate() === now.getDate();
        } else if (dateFilter === "month") {
          dateMatches =
            createdAt.getFullYear() === now.getFullYear() &&
            createdAt.getMonth() === now.getMonth();
        } else if (dateFilter === "year") {
          dateMatches = createdAt.getFullYear() === now.getFullYear();
        }
      }

      return searchMatches && statusMatches && serviceMatches && dateMatches;
    });
  }, [requests, searchTerm, dateFilter, statusFilter, serviceFilter]);

  const statusOptions = useMemo(() => {
    return [...new Set(requests.map((req) => req.status).filter(Boolean))];
  }, [requests]);

  const serviceOptions = useMemo(() => {
    return [...new Set(requests.map((req) => req.service_name).filter(Boolean))];
  }, [requests]);

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
    dateFilter,
    statusFilter,
    serviceFilter,
    statusOptions,
    serviceOptions,
    setSearchTerm,
    setDateFilter,
    setStatusFilter,
    setServiceFilter,
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    fetchRequestById,
    refresh: fetchRequests,
  };
}
