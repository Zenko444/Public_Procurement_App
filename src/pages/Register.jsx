import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';

const registerSchema = z.object({
  email: z.string().email('Adresa de email este invalidă'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Numele primăriei este obligatoriu'),
  taxId: z.string().min(2, 'CUI-ul este obligatoriu'),
  contactName: z.string().min(2, 'Numele persoanei de contact este obligatoriu'),
  contactEmail: z.string().email('Adresa de email de contact este invalidă'),
  contactPhone: z.string().min(10, 'Numărul de telefon este obligatoriu'),
  locality: z.string().min(2, 'Localitatea este obligatorie'),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
});

export default function Register() {
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleNextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['email', 'password', 'confirmPassword']
      : ['name', 'taxId', 'contactName', 'contactEmail', 'contactPhone', 'locality'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, {
      name: data.name,
      taxId: data.taxId,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      locality: data.locality,
      address: data.address,
    });
    setLoading(false);
    if (!error) {
      navigate('/login');
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-baby-light/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-medium text-slate-800 mb-3">Smart City</h2>
          <p className="text-lg text-slate-600 font-extralight">
            Conectați-vă la Supabase pentru a activa înregistrarea.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-baby-light/20 p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center shadow-lg shadow-baby-blue/25">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">Înregistrare Primărie</h1>
          <p className="text-lg text-slate-600 font-extralight">
            Pasul {step} din 2
          </p>
        </div>

        <div className="flex mb-4 bg-slate-100 rounded-2xl p-1">
          <Link 
            to="/login" 
            className="flex-1 py-3 px-4 rounded-xl text-slate-500 font-extralight text-lg text-center hover:text-slate-700 transition-all"
          >
            Autentificare
          </Link>
          <button className="flex-1 py-3 px-4 rounded-xl bg-white text-baby-dark font-medium text-lg shadow-sm transition-all">
            Înregistrare
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-baby-dark' : 'bg-slate-200'}`} />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-baby-dark' : 'bg-slate-200'}`} />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-medium text-slate-800 mb-4">Informații de autentificare</h2>
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="primarie@exemplu.ro"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <FormInput
                  label="Parolă"
                  type="password"
                  placeholder="Minim 6 caractere"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <FormInput
                  label="Confirmă parola"
                  type="password"
                  placeholder="Repetă parola"
                  icon={Lock}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full"
                  size="lg"
                >
                  Continuă
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-medium text-slate-800 mb-4">Informații primărie</h2>

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Numele primăriei"
                    type="text"
                    placeholder="Primăria Orașul"
                    icon={Building2}
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <FormInput
                    label="CUI"
                    type="text"
                    placeholder="RO12345678"
                    icon={FileText}
                    error={errors.taxId?.message}
                    {...register('taxId')}
                  />
                </div>

                <FormInput
                  label="Persoană de contact"
                  type="text"
                  placeholder="Nume și prenume"
                  icon={User}
                  error={errors.contactName?.message}
                  {...register('contactName')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Email contact"
                    type="email"
                    placeholder="contact@primarie.ro"
                    icon={Mail}
                    error={errors.contactEmail?.message}
                    {...register('contactEmail')}
                  />

                  <FormInput
                    label="Telefon contact"
                    type="tel"
                    placeholder="0721123456"
                    icon={Phone}
                    error={errors.contactPhone?.message}
                    {...register('contactPhone')}
                  />
                </div>

                <FormInput
                  label="Localitate"
                  type="text"
                  placeholder="Orașul / Comuna"
                  icon={MapPin}
                  error={errors.locality?.message}
                  {...register('locality')}
                />

                <FormInput
                  label="Adresă (opțional)"
                  type="text"
                  placeholder="Strada, număr"
                  icon={MapPin}
                  {...register('address')}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    size="lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Înapoi
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                    size="lg"
                  >
                    Înregistrare
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}