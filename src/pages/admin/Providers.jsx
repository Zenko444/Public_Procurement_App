import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Building2,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { useServices } from "../../hooks/useServices";
import FormInput from "../../components/ui/FormInput";
import Button from "../../components/ui/Button";

const providerSchema = z.object({
  name: z.string().min(3, "Numele trebuie sa aiba minim 3 caractere"),
  tax_id: z.string().min(5, "CUI-ul trebuie sa aiba minim 5 caractere"),
  contact_email: z.string().email("Email invalid").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export default function ProvidersAdmin() {
  const navigate = useNavigate();
  const { providers, refresh, loading } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: "",
      tax_id: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      description: "",
    },
  });

  const openCreateForm = () => {
    setEditingProvider(null);
    reset({
      name: "",
      tax_id: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      description: "",
    });
    setShowForm(true);
  };

  const openEditForm = (provider) => {
    setEditingProvider(provider);
    reset({
      name: provider.name || "",
      tax_id: provider.tax_id || "",
      contact_email: provider.contact_email || "",
      contact_phone: provider.contact_phone || "",
      address: provider.address || "",
      description: provider.description || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProvider(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const providerData = {
        name: data.name,
        tax_id: data.tax_id,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        address: data.address || null,
        description: data.description || null,
        is_active: true,
      };

      if (editingProvider) {
        const { error } = await supabase
          .from("service_providers")
          .update(providerData)
          .eq("id", editingProvider.id);

        if (error) throw error;
        toast.success("Furnizorul a fost actualizat!");
      } else {
        const { error } = await supabase
          .from("service_providers")
          .insert(providerData);

        if (error) throw error;
        toast.success("Furnizorul a fost adaugat!");
      }

      closeForm();
      refresh();
    } catch (error) {
      console.error("Error saving provider:", error);
      if (error.code === "23505") {
        toast.error("Un furnizor cu acest CUI exista deja");
      } else {
        toast.error("Eroare la salvarea furnizorului");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (provider) => {
    try {
      const { error } = await supabase
        .from("service_providers")
        .update({ is_active: !provider.is_active })
        .eq("id", provider.id);

      if (error) throw error;
      toast.success(
        provider.is_active ? "Furnizor dezactivat" : "Furnizor activat"
      );
      refresh();
    } catch (error) {
      console.error("Error toggling provider:", error);
      toast.error("Eroare la actualizare");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500 font-extralight">
          Se incarca...
        </div>
      </div>
    );
  }

  return (
    <div id="providers-admin-page" className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/requests")}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-slate-800">
            Administrare Furnizori
          </h1>
          <p className="text-lg text-slate-500 font-extralight">
            {providers.length} furnizori in total
          </p>
        </div>
        <Button icon={Plus} onClick={openCreateForm}>
          Adauga Furnizor
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                  {editingProvider ? (
                    <Edit2 className="w-5 h-5 text-baby-dark" />
                  ) : (
                    <Plus className="w-5 h-5 text-baby-dark" />
                  )}
                </div>
                <h2 className="text-xl font-medium text-slate-800">
                  {editingProvider ? "Editeaza Furnizor" : "Furnizor Nou"}
                </h2>
              </div>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="Nume Furnizor"
                  placeholder="Ex: AquaServ SRL"
                  icon={Building2}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <FormInput
                  label="CUI"
                  placeholder="Ex: RO12345678"
                  icon={FileText}
                  error={errors.tax_id?.message}
                  {...register("tax_id")}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="Email Contact"
                  type="email"
                  placeholder="contact@furnizor.ro"
                  icon={Mail}
                  error={errors.contact_email?.message}
                  {...register("contact_email")}
                />
                <FormInput
                  label="Telefon Contact"
                  placeholder="0721 123 456"
                  icon={Phone}
                  error={errors.contact_phone?.message}
                  {...register("contact_phone")}
                />
              </div>

              <FormInput
                label="Adresa"
                placeholder="Adresa furnizorului"
                error={errors.address?.message}
                {...register("address")}
              />

              <div className="space-y-2">
                <label className="block text-lg font-medium text-slate-700">
                  Descriere (optional)
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Descrieti furnizorul si serviciile oferite..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-lg font-extralight text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Anuleaza
                </Button>
                <Button type="submit" loading={submitting} icon={Save}>
                  {editingProvider ? "Salveaza" : "Adauga"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Furnizor
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  CUI
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Contact
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-lg font-medium text-slate-600">
                  Actiuni
                </th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, index) => (
                <motion.tr
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-baby-dark" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-800">
                          {provider.name}
                        </p>
                        {provider.description && (
                          <p className="text-lg text-slate-500 font-extralight truncate max-w-[250px]">
                            {provider.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg text-slate-700 font-extralight">
                      {provider.tax_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {provider.contact_email && (
                        <p className="text-lg text-slate-700 font-extralight">
                          {provider.contact_email}
                        </p>
                      )}
                      {provider.contact_phone && (
                        <p className="text-lg text-slate-500 font-extralight">
                          {provider.contact_phone}
                        </p>
                      )}
                      {!provider.contact_email && !provider.contact_phone && (
                        <span className="text-lg text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(provider)}
                      className={`px-3 py-1 rounded-lg text-lg font-medium transition-colors ${
                        provider.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {provider.is_active ? "Activ" : "Inactiv"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditForm(provider)}
                      className="inline-flex items-center gap-2 text-lg text-baby-dark hover:text-baby-blue transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editeaza
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
