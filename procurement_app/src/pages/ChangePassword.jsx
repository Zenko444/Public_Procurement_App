import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { Lock, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/ui/FormInput';
import Button from '../components/ui/Button';

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Parolele nu coincid',
  path: ['confirmPassword'],
});

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const { error } = await changePassword(data.newPassword);
    setLoading(false);
    if (!error) {
      reset();
      navigate('/requests');
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/requests')}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">Schimbă parola</h1>
          <p className="text-lg text-slate-500 font-extralight">
            Actualizați parola contului dvs.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormInput
            label="Parolă nouă"
            type="password"
            placeholder="Minim 6 caractere"
            icon={Lock}
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <FormInput
            label="Confirmă parola nouă"
            type="password"
            placeholder="Repetă parola"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/requests')}
              className="flex-1"
              size="lg"
            >
              Anulează
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={Save}
              className="flex-1"
              size="lg"
            >
              Salvează
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
