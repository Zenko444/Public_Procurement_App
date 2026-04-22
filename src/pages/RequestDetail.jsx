import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Building2,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import toast from "react-hot-toast";
import { useRequests } from "../hooks/useRequests";
import { useServices } from "../hooks/useServices";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import FormSelect from "../components/ui/FormSelect";

const editSchema = z.object({
  title: z.string().min(5, "Titlul trebuie sa aiba minim 5 caractere"),
  description: z.string().optional(),
  has_estimated_start_date: z.boolean(),
  estimated_start_date: z.string().optional(),
});

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cityHall } = useAuth();
  const { getRequestById, fetchRequestById, updateRequest, deleteRequest, loading: requestsLoading, refresh } = useRequests();
  const { services, providers, getActiveServices, getActiveProviders } = useServices();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      has_estimated_start_date: false,
      estimated_start_date: "",
    },
  });

  const hasEstimatedDate = watch("has_estimated_start_date");

  useEffect(() => {
    const loadRequest = async () => {
      setLoading(true);
      let foundRequest = getRequestById(id);
      if (!foundRequest) {
        foundRequest = await fetchRequestById(id);
      }
      setRequest(foundRequest);
      setLoading(false);
    };
    if (!requestsLoading) {
      loadRequest();
    }
  }, [id, getRequestById, fetchRequestById, requestsLoading]);

  const openEditMode = () => {
    if (request) {
      reset({
        title: request.title || "",
        description: request.description || "",
        has_estimated_start_date: request.has_estimated_start_date || false,
        estimated_start_date: request.estimated_start_date || "",
      });
      setSelectedProvider(request.provider_id || "");
      setSelectedService(request.service_id || "");
      setIsEditing(true);
    }
  };

  const closeEditMode = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    if (!request) return;
    setSubmitting(true);
    const provider = providers.find((p) => p.id === selectedProvider);
    const service = services.find((s) => s.id === selectedService);
    const updateData = {
      title: data.title,
      description: data.description || null,
      has_estimated_start_date: data.has_estimated_start_date,
      estimated_start_date: data.has_estimated_start_date ? data.estimated_start_date : null,
      provider_id: selectedProvider || null,
      provider_name: provider?.name || request.provider_name,
      provider_tax_id: provider?.tax_id || request.provider_tax_id,
      service_id: selectedService || null,
      service_name: service?.name || request.service_name,
    };
    const result = await updateRequest(request.id, updateData);
    if (!result.error) {
      setRequest({ ...request, ...updateData });
      setIsEditing(false);
      refresh();
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!request) return;
    setDeleting(true);
    const result = await deleteRequest(request.id);
    if (result.success) {
      navigate("/requests");
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  const availableServices = selectedProvider
    ? services.filter((s) => s.provider_id === selectedProvider && s.is_active)
    : getActiveServices();

  if (loading || requestsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500 font-extralight">
          Se incarca...
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-slate-800 mb-2">
            Cererea nu a fost gasita
          </h2>
          <p className="text-lg text-slate-500 font-extralight mb-6">
            Cererea pe care o cautati nu exista sau nu aveti acces la ea.
          </p>
          <button
            onClick={() => navigate("/requests")}
            className="text-baby-dark hover:text-baby-blue transition-colors font-medium"
          >
            Inapoi la cereri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="request-detail-page" className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/requests")}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-semibold text-slate-800">
              {request.title}
            </h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-lg text-slate-500 font-extralight">
            Creata pe{" "}
            {format(new Date(request.created_at), "d MMMM yyyy, HH:mm", {
              locale: ro,
            })}
          </p>
        </div>
        {request.status === "pending" && !isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={Edit2}
              onClick={openEditMode}
            >
              Editeaza
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Sterge
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-baby-dark" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-800">
                    Editeaza cererea
                  </h2>
                </div>
                <button
                  onClick={closeEditMode}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <FormInput
                  label="Titlu cerere"
                  placeholder="Ex: Extindere retea apa potabila"
                  error={errors.title?.message}
                  {...register("title")}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Furnizor"
                    placeholder="Selecteaza furnizorul"
                    options={getActiveProviders()}
                    value={selectedProvider}
                    onChange={(value) => {
                      setSelectedProvider(value);
                      setSelectedService("");
                    }}
                    searchable
                  />
                  <FormSelect
                    label="Serviciu"
                    placeholder="Selecteaza serviciul"
                    options={availableServices}
                    value={selectedService}
                    onChange={setSelectedService}
                    disabled={!selectedProvider}
                    searchable
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium text-slate-700">
                    Descriere (optional)
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Descrieti cererea in detaliu..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-lg font-extralight text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("has_estimated_start_date")}
                      className="w-5 h-5 rounded border-slate-300 text-baby-dark focus:ring-baby-blue"
                    />
                    <span className="text-lg text-slate-700 font-extralight">
                      Doresc o data estimata de inceput
                    </span>
                  </label>

                  {hasEstimatedDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FormInput
                        type="date"
                        label="Data estimata de inceput"
                        error={errors.estimated_start_date?.message}
                        {...register("estimated_start_date")}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeEditMode}>
                    Anuleaza
                  </Button>
                  <Button type="submit" loading={submitting} icon={Save}>
                    Salveaza modificarile
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="details-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-baby-dark" />
                </div>
                <h2 className="text-xl font-medium text-slate-800">
                  Detalii cerere
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-lg text-slate-500 font-extralight mb-1">
                    Serviciu solicitat
                  </p>
                  <p className="text-lg text-slate-800">{request.service_name}</p>
                </div>
                <div>
                  <p className="text-lg text-slate-500 font-extralight mb-1">
                    Furnizor
                  </p>
                  <p className="text-lg text-slate-800">{request.provider_name}</p>
                </div>
                <div>
                  <p className="text-lg text-slate-500 font-extralight mb-1">
                    CUI Furnizor
                  </p>
                  <p className="text-lg text-slate-800">{request.provider_tax_id}</p>
                </div>
                <div>
                  <p className="text-lg text-slate-500 font-extralight mb-1">
                    Data cererii
                  </p>
                  <p className="text-lg text-slate-800">
                    {format(new Date(request.request_date), "d MMMM yyyy", {
                      locale: ro,
                    })}
                  </p>
                </div>
                {request.has_estimated_start_date && request.estimated_start_date && (
                  <div>
                    <p className="text-lg text-slate-500 font-extralight mb-1">
                      Data estimata de inceput
                    </p>
                    <p className="text-lg text-slate-800">
                      {format(new Date(request.estimated_start_date), "d MMMM yyyy", {
                        locale: ro,
                      })}
                    </p>
                  </div>
                )}
              </div>

              {request.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-lg text-slate-500 font-extralight mb-2">
                    Descriere
                  </p>
                  <p className="text-lg text-slate-800 font-extralight whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              )}

              {request.status_notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-lg text-slate-500 font-extralight mb-2">
                    Note status
                  </p>
                  <p className="text-lg text-slate-800 font-extralight whitespace-pre-wrap">
                    {request.status_notes}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-baby-dark" />
            </div>
            <h2 className="text-xl font-medium text-slate-800">
              Informatii primarie
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-lg text-slate-500 font-extralight">
                  Primarie
                </p>
                <p className="text-lg text-slate-800">
                  {request.city_hall_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-lg text-slate-500 font-extralight">CUI</p>
                <p className="text-lg text-slate-800">
                  {request.city_hall_tax_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-lg text-slate-500 font-extralight">
                  Persoana contact
                </p>
                <p className="text-lg text-slate-800">
                  {request.contact_person_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-lg text-slate-500 font-extralight">Email</p>
                <p className="text-lg text-slate-800">
                  {request.contact_person_email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-lg text-slate-500 font-extralight">
                  Telefon
                </p>
                <p className="text-lg text-slate-800">
                  {request.contact_person_phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-lg text-slate-500 font-extralight">
                  Localitate
                </p>
                <p className="text-lg text-slate-800">{request.locality}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    Sterge cererea
                  </h3>
                  <p className="text-lg text-slate-500 font-extralight">
                    Aceasta actiune este ireversibila
                  </p>
                </div>
              </div>

              <p className="text-lg text-slate-600 font-extralight mb-6">
                Esti sigur ca vrei sa stergi cererea "{request.title}"? 
                Toate datele asociate vor fi pierdute permanent.
              </p>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Anuleaza
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={deleting}
                  icon={Trash2}
                >
                  Sterge definitiv
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
