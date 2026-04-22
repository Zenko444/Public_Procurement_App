import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useServices() {
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, providersRes] = await Promise.all([
        supabase.from("services").select("*").order("name"),
        supabase.from("service_providers").select("*").order("name"),
      ]);

      if (servicesRes.error) {
        console.error("Error fetching services:", servicesRes.error);
      } else {
        setServices(servicesRes.data || []);
      }

      if (providersRes.error) {
        console.error("Error fetching providers:", providersRes.error);
      } else {
        setProviders(providersRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getProviderById = useCallback(
    (providerId) => {
      return providers.find((p) => p.id === providerId);
    },
    [providers]
  );

  const getServicesByProvider = useCallback(
    (providerId) => {
      return services.filter((s) => s.provider_id === providerId);
    },
    [services]
  );

  const getActiveServices = useCallback(() => {
    return services.filter((s) => s.is_active);
  }, [services]);

  const getActiveProviders = useCallback(() => {
    return providers.filter((p) => p.is_active);
  }, [providers]);

  return {
    services,
    providers,
    loading,
    getProviderById,
    getServicesByProvider,
    getActiveServices,
    getActiveProviders,
    refresh: fetchData,
  };
}
