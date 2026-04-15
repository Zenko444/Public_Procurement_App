import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cityHall, setCityHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured] = useState(true);

  const fetchCityHallProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("city_halls")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching city hall:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Error in fetchCityHallProfile:", err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          // Fetch profile in background - don't block loading
          fetchCityHallProfile(session.user.id)
            .then((profile) => {
              if (isMounted) {
                setCityHall(profile);
              }
            })
            .catch(console.error);
        }
      } catch (error) {
        console.error("Init auth error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (event === "SIGNED_OUT") {
          setUser(null);
          setCityHall(null);
          setLoading(false);
        } else if (session?.user) {
          setUser(session.user);
          setLoading(false);
          // Fetch profile in background
          fetchCityHallProfile(session.user.id)
            .then((profile) => {
              if (isMounted) {
                setCityHall(profile);
              }
            })
            .catch(console.error);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, cityHallData) => {
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Handle rate limiting errors with better messages
        if (authError.message.includes("rate") || authError.status === 429) {
          toast.error("Prea multe incercari. Va rugam asteptati cateva secunde.");
        } else if (authError.message.includes("already registered")) {
          toast.error("Acest email este deja inregistrat.");
        } else {
          toast.error(authError.message);
        }
        return { data: null, error: authError };
      }

      if (authData.user) {
        // Create the city hall profile
        const { data: profileData, error: profileError } = await supabase
          .from("city_halls")
          .insert({
            user_id: authData.user.id,
            name: cityHallData.name,
            tax_id: cityHallData.taxId,
            contact_person_name: cityHallData.contactName,
            contact_person_email: cityHallData.contactEmail,
            contact_person_phone: cityHallData.contactPhone,
            locality: cityHallData.locality,
            address: cityHallData.address || null,
          })
          .select()
          .single();

        if (profileError) {
          console.error("Error creating city hall profile:", profileError);
          // Check for specific errors
          if (profileError.code === "23505") {
            toast.error("Un profil de primarie exista deja pentru acest utilizator.");
          } else if (profileError.code === "42501") {
            toast.error("Nu aveti permisiunea de a crea un profil.");
          } else {
            toast.error("Eroare la crearea profilului primariei: " + profileError.message);
          }
          return { data: null, error: profileError };
        }

        toast.success("Cont creat cu succes! Verificati email-ul pentru confirmare.");
        return { data: authData, error: null };
      }

      return { data: authData, error: null };
    } catch (err) {
      console.error("SignUp error:", err);
      toast.error("Eroare neasteptata la inregistrare. Incercati din nou.");
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { data: null, error };
      }

      if (data.user) {
        setUser(data.user);
        // Fetch profile in background
        fetchCityHallProfile(data.user.id)
          .then((profile) => {
            setCityHall(profile);
          })
          .catch(console.error);
        toast.success("Autentificare reusita!");
      }

      return { data, error: null };
    } catch (err) {
      toast.error("Eroare la autentificare");
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCityHall(null);
      toast.success("V-ati deconectat cu succes.");
    } catch (error) {
      toast.error("Eroare la deconectare");
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success("Parola a fost schimbata cu succes!");
      return { error: null };
    } catch (err) {
      toast.error("Eroare la schimbarea parolei");
      return { error: err };
    }
  };

  const updateCityHallProfile = async (updates) => {
    if (!cityHall) return { error: new Error("No city hall profile") };

    try {
      const { data, error } = await supabase
        .from("city_halls")
        .update(updates)
        .eq("id", cityHall.id)
        .select()
        .single();

      if (error) {
        toast.error("Eroare la actualizarea profilului");
        return { data: null, error };
      }

      setCityHall(data);
      toast.success("Profil actualizat cu succes!");
      return { data, error: null };
    } catch (err) {
      toast.error("Eroare la actualizarea profilului");
      return { data: null, error: err };
    }
  };

  const refreshCityHall = async () => {
    if (user) {
      const profile = await fetchCityHallProfile(user.id);
      setCityHall(profile);
    }
  };

  const value = {
    user,
    cityHall,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    changePassword,
    updateCityHallProfile,
    refreshCityHall,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
