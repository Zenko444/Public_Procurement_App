import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Settings,
  ArrowLeft,
  Edit2,
  Save,
  X,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { useServices } from "../../hooks/useServices";
import FormInput from "../../components/ui/FormInput";
import FormSelect from "../../components/ui/FormSelect";
import Button from "../../components/ui/Button";

const serviceSchema = z.object({
  name: z.string().min(3, "Numele trebuie sa aiba minim 3 caractere"),
  description: z.string().optional(),
  category: z.string().optional(),
  provider_id: z.string().optional(),
});

export default function ServicesAdmin() {
  const navigate = useNavigate();
  const { services, providers, refresh, loading } = useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      provider_id: "",
    },
  });

  const providerId = watch("provider_id");

  const openCreateForm = () => {
    setEditingService(null);
    reset({
      name: "",
      description: "",
      category: "",
      provider_id: "",
    });
    setShowForm(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);
    reset({
      name: service.name || "",
      description: service.description || "",
      category: service.category || "",
      provider_id: service.provider_id || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingService(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const serviceData = {
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        provider_id: data.provider_id || null,
        is_active: true,
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", editingService.id);

        if (error) throw error;
        toast.success("Serviciul a fost actualizat!");
      } else {
        const { error } = await supabase.from("services").insert(serviceData);

        if (error) throw error;
        toast.success("Serviciul a fost adaugat!");
      }

      closeForm();
      refresh();
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Eroare la salvarea serviciului");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ is_active: !service.is_active })
        .eq("id", service.id);

      if (error) throw error;
      toast.success(
        service.is_active ? "Serviciu dezactivat" : "Serviciu activat"
      );
      refresh();
    } catch (error) {
      console.error("Error toggling service:", error);
      toast.error("Eroare la actualizare");
    }
  };

  const getProviderName = (providerId) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.name || "-";
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
    <div id="services-admin-page" className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/requests")}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-slate-800">
            Administrare Servicii
          </h1>
          <p className="text-lg text-slate-500 font-extralight">
            {services.length} servicii in total
          </p>
        </div>
        <Button icon={Plus} onClick={openCreateForm}>
          Adauga Serviciu
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
                  {editingService ? (
                    <Edit2 className="w-5 h-5 text-baby-dark" />
                  ) : (
                    <Plus className="w-5 h-5 text-baby-dark" />
                  )}
                </div>
                <h2 className="text-xl font-medium text-slate-800">
                  {editingService ? "Editeaza Serviciu" : "Serviciu Nou"}
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
                  label="Nume Serviciu"
                  placeholder="Ex: Alimentare cu apa potabila"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <FormInput
                  label="Categorie"
                  placeholder="Ex: Utilitati"
                  error={errors.category?.message}
                  {...register("category")}
                />
              </div>

              <FormSelect
                label="Furnizor asociat"
                placeholder="Selecteaza furnizorul (optional)"
                options={providers.filter((p) => p.is_active)}
                value={providerId || ""}
                onChange={(value) => setValue("provider_id", value)}
                searchable
              />

              <div className="space-y-2">
                <label className="block text-lg font-medium text-slate-700">
                  Descriere (optional)
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Descrieti serviciul..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-lg font-extralight text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Anuleaza
                </Button>
                <Button type="submit" loading={submitting} icon={Save}>
                  {editingService ? "Salveaza" : "Adauga"}
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
                  Serviciu
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Categorie
                </th>
                <th className="text-left px-6 py-4 text-lg font-medium text-slate-600">
                  Furnizor
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
              {services.map((service, index) => (
                <motion.tr
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-baby-dark" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-800">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-lg text-slate-500 font-extralight truncate max-w-[250px]">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg text-slate-700 font-extralight">
                      {service.category || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg text-slate-700 font-extralight">
                      {getProviderName(service.provider_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(service)}
                      className={`px-3 py-1 rounded-lg text-lg font-medium transition-colors ${
                        service.is_active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {service.is_active ? "Activ" : "Inactiv"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditForm(service)}
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
