import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  Building2,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Send,
  CheckSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useRequests } from "../hooks/useRequests";
import { useServices } from "../hooks/useServices";
import FormInput from "../components/ui/FormInput";
import FormSelect from "../components/ui/FormSelect";
import Button from "../components/ui/Button";

const requestSchema = z
  .object({
    title: z.string().min(3, "Titlul trebuie sa aiba minim 3 caractere"),
    description: z.string().optional(),
    serviceId: z.string().min(1, "Selectati un serviciu"),
    providerId: z.string().min(1, "Selectati un furnizor"),
    hasEstimatedStartDate: z.boolean(),
    estimatedStartDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasEstimatedStartDate && !data.estimatedStartDate) {
        return false;
      }
      return true;
    },
    {
      message: "Data estimata de inceput este obligatorie",
      path: ["estimatedStartDate"],
    }
  );

export default function CreateRequest() {
  const { cityHall } = useAuth();
  const { createRequest } = useRequests();
  const { getActiveServices, getActiveProviders, getProviderById, loading: servicesLoading } =
    useServices();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const services = getActiveServices();
  const providers = getActiveProviders();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      serviceId: "",
      providerId: "",
      hasEstimatedStartDate: false,
      estimatedStartDate: "",
    },
  });

  const watchProviderId = watch("providerId");
  const watchHasEstimatedStartDate = watch("hasEstimatedStartDate");

  useEffect(() => {
    if (watchProviderId) {
      const provider = getProviderById(watchProviderId);
      setSelectedProvider(provider);
    } else {
      setSelectedProvider(null);
    }
  }, [watchProviderId, getProviderById]);

  useEffect(() => {
    setShowDatePicker(watchHasEstimatedStartDate);
    if (!watchHasEstimatedStartDate) {
      setValue("estimatedStartDate", "");
    }
  }, [watchHasEstimatedStartDate, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    const service = services.find((s) => s.id === data.serviceId);
    const provider = getProviderById(data.providerId);

    const requestData = {
      title: data.title,
      description: data.description || null,
      service_id: data.serviceId,
      provider_id: data.providerId,
      service_name: service?.name || "",
      provider_name: provider?.name || "",
      provider_tax_id: provider?.tax_id || "",
      has_estimated_start_date: data.hasEstimatedStartDate,
      estimated_start_date: data.hasEstimatedStartDate
        ? data.estimatedStartDate
        : null,
    };

    const { error } = await createRequest(requestData);
    setLoading(false);
    if (!error) {
      navigate("/requests");
    }
  };

  const currentDate = format(new Date(), "dd.MM.yyyy");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/requests")}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Cerere noua</h1>
          <p className="text-lg text-slate-500 font-extralight">
            Completati formularul pentru a trimite o cerere
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-baby-dark" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-800">
                  Informatii primarie
                </h2>
                <p className="text-lg text-slate-500 font-extralight">
                  Completate automat din profilul dvs.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                label="Numele primariei"
                value={cityHall?.name || ""}
                readOnly
                icon={Building2}
              />
              <FormInput
                label="CUI"
                value={cityHall?.tax_id || ""}
                readOnly
                icon={FileText}
              />
              <FormInput
                label="Persoana de contact"
                value={cityHall?.contact_person_name || ""}
                readOnly
                icon={User}
              />
              <FormInput
                label="Email contact"
                value={cityHall?.contact_person_email || ""}
                readOnly
                icon={Mail}
              />
              <FormInput
                label="Telefon contact"
                value={cityHall?.contact_person_phone || ""}
                readOnly
                icon={Phone}
              />
              <FormInput
                label="Localitate"
                value={cityHall?.locality || ""}
                readOnly
                icon={MapPin}
              />
              <FormInput
                label="Data cererii"
                value={currentDate}
                readOnly
                icon={Calendar}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-baby-light/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-baby-dark" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-slate-800">
                  Detalii cerere
                </h2>
                <p className="text-lg text-slate-500 font-extralight">
                  Completati informatiile despre serviciul dorit
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <FormInput
                label="Titlul cererii"
                type="text"
                placeholder="Ex: Solicitare extindere retea apa"
                error={errors.title?.message}
                {...register("title")}
              />

              <div className="space-y-2">
                <label className="block text-lg font-medium text-slate-700">
                  Descriere (optional)
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Descrieti pe scurt cererea dvs..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-lg font-extralight text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-baby-blue/50 focus:border-baby-blue transition-all resize-none"
                />
              </div>

              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Serviciu dorit"
                    placeholder="Selectati serviciul"
                    options={services}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    searchable
                    error={errors.serviceId?.message}
                    disabled={servicesLoading}
                  />
                )}
              />

              <Controller
                name="providerId"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    label="Furnizor"
                    placeholder="Selectati furnizorul"
                    options={providers}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    searchable
                    error={errors.providerId?.message}
                    disabled={servicesLoading}
                  />
                )}
              />

              {selectedProvider && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-slate-50 rounded-xl p-4"
                >
                  <p className="text-lg text-slate-600 font-extralight">
                    <span className="font-medium">CUI Furnizor:</span>{" "}
                    {selectedProvider.tax_id}
                  </p>
                </motion.div>
              )}

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      {...register("hasEstimatedStartDate")}
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-baby-dark peer-checked:border-baby-dark flex items-center justify-center transition-all group-hover:border-baby-blue">
                      <CheckSquare className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-lg text-slate-700 font-extralight">
                    Am o data estimata de inceput
                  </span>
                </label>

                {showDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <FormInput
                      label="Data estimata de inceput"
                      type="date"
                      icon={Calendar}
                      min={format(new Date(), "yyyy-MM-dd")}
                      error={errors.estimatedStartDate?.message}
                      {...register("estimatedStartDate")}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/requests")}
              size="lg"
            >
              Anuleaza
            </Button>
            <Button type="submit" loading={loading} icon={Send} size="lg">
              Trimite cererea
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
