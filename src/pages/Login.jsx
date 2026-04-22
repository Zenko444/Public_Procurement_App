import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Adresa de email este invalidă'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
});

export default function Login() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (!error) {
      navigate('/requests');
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
          <p className="text-lg text-slate-600 font-extralight mb-6">
            Conectați-vă la Supabase pentru a activa autentificarea.
          </p>
          <p className="text-lg text-slate-500 font-extralight">
            Apăsați butonul "Connect to Supabase" din interfață.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-baby-light/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-baby-light to-baby-dark flex items-center justify-center shadow-lg shadow-baby-blue/25">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">Smart City</h1>
          <p className="text-lg text-slate-600 font-extralight">
            Autentificați-vă pentru a continua
          </p>
        </div>

        <div className="flex mb-6 bg-slate-100 rounded-2xl p-1">
          <button className="flex-1 py-3 px-4 rounded-xl bg-white text-baby-dark font-medium text-lg shadow-sm transition-all">
            Autentificare
          </button>
          <Link 
            to="/register" 
            className="flex-1 py-3 px-4 rounded-xl text-slate-500 font-extralight text-lg text-center hover:text-slate-700 transition-all"
          >
            Înregistrare
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Autentificare
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}