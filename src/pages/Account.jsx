import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Edit2,
  X,
  Key,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";

const profileSchema = z.object({
  name: z.string().min(2, "Numele este obligatoriu"),
  tax_id: z.string().min(2, "CUI-ul este obligatoriu"),
  contact_person_name: z.string().min(2, "Numele persoanei de contact este obligatoriu"),
  contact_person_email: z.string().email("Email invalid"),
  contact_person_phone: z.string().min(10, "Numarul de telefon este obligatoriu"),
  locality: z.string().min(2, "Localitatea este obligatorie"),
  address: z.string().optional(),
});

export default function Account() {
  const navigate = useNavigate();
  const { user, cityHall, updateCityHallProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: cityHall?.name || "",
      tax_id: cityHall?.tax_id || "",
      contact_person_name: cityHall?.contact_person_name || "",
      contact_person_email: cityHall?.contact_person_email || "",
      contact_person_phone: cityHall?.contact_person_phone || "",
      locality: cityHall?.locality || "",
      address: cityHall?.address || "",
    },
  });

  const openEdit = () => {
    reset({
      name: cityHall?.name || "",
      tax_id: cityHall?.tax_id || "",
      contact_person_name: cityHall?.contact_person_name || "",
      contact_person_email: cityHall?.contact_person_email || "",
      contact_person_phone: cityHall?.contact_person_phone || "",
      locality: cityHall?.locality || "",
      address: cityHall?.address || "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data) => {
    setSaving(true);
    const result = await updateCityHallProfile(data);
    setSaving(false);
    if (!result.error) {
      setIsEditing(false);
    }
  };

  const infoRow = (icon, label, value) => {
    const Icon = icon;
    return (
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center mt-0.5">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-lg text-slate-500 font-extralight">{label}</p>
          <p className="text-lg text-slate-800">{value || "-"}</p>
        </div>
      </div>
    );
  };

  return (
    <div id="account-page" className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-slate-800">Contul meu</h1>
          <p className="text-lg text-slate-500 font-extralight">
            Vizualizati si editati informatiile contului
          </p>
        </div>
        {!isEditing && (
          <Button icon={Edit2} variant="outline" onClick={openEdit}>
            Editeaza profilul
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-800">
              Informatii cont
            </h2>
            <p className="text-lg text-slate-500 font-extralight">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-md">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-lg text-slate-500 font-extralight">Email</p>
              <p className="text-lg text-slate-800">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-md">
            <Key className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-lg text-slate-500 font-extralight">Parola</p>
              <button
                onClick={() => navigate("/change-password")}
                className="text-lg text-baby-dark hover:text-baby-blue transition-colors font-medium"
              >
                Schimba parola
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-md shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-baby-light/30 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-baby-dark" />
              </div>
              <h2 className="text-xl font-medium text-slate-800">
                Editeaza profilul primariei
              </h2>
            </div>
            <button
              onClick={cancelEdit}
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
                label="Numele primariei"
                placeholder="Primaria Orasului"
                icon={Building2}
                error={errors.name?.message}
                {...register("name")}
              />
              <FormInput
                label="CUI"
                placeholder="RO12345678"
                icon={FileText}
                error={errors.tax_id?.message}
                {...register("tax_id")}
              />
            </div>

            <FormInput
              label="Persoana de contact"
              placeholder="Nume si prenume"
              icon={User}
              error={errors.contact_person_name?.message}
              {...register("contact_person_name")}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                label="Email contact"
                type="email"
                placeholder="contact@primarie.ro"
                icon={Mail}
                error={errors.contact_person_email?.message}
                {...register("contact_person_email")}
              />
              <FormInput
                label="Telefon contact"
                type="tel"
                placeholder="0721123456"
                icon={Phone}
                error={errors.contact_person_phone?.message}
                {...register("contact_person_phone")}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                label="Localitate"
                placeholder="Orasul / Comuna"
                icon={MapPin}
                error={errors.locality?.message}
                {...register("locality")}
              />
              <FormInput
                label="Adresa (optional)"
                placeholder="Strada, numar"
                icon={MapPin}
                {...register("address")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Anuleaza
              </Button>
              <Button type="submit" loading={saving} icon={Save}>
                Salveaza modificarile
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-md shadow-sm border border-slate-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-baby-light/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-baby-dark" />
            </div>
            <h2 className="text-xl font-medium text-slate-800">
              Profil primarie
            </h2>
          </div>

          {cityHall ? (
            <div className="grid md:grid-cols-2 gap-6">
              {infoRow(Building2, "Numele primariei", cityHall.name)}
              {infoRow(FileText, "CUI", cityHall.tax_id)}
              {infoRow(User, "Persoana de contact", cityHall.contact_person_name)}
              {infoRow(Mail, "Email contact", cityHall.contact_person_email)}
              {infoRow(Phone, "Telefon contact", cityHall.contact_person_phone)}
              {infoRow(MapPin, "Localitate", cityHall.locality)}
              {infoRow(MapPin, "Adresa", cityHall.address)}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center mt-0.5">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-lg text-slate-500 font-extralight">
                    Data inregistrarii
                  </p>
                  <p className="text-lg text-slate-800">
                    {cityHall.created_at
                      ? format(
                          new Date(cityHall.created_at),
                          "d MMMM yyyy",
                          { locale: ro }
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-lg text-slate-500 font-extralight">
              Profilul primariei nu este configurat.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
