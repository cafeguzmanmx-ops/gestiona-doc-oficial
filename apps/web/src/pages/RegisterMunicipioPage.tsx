import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  municipioName: z.string().min(3, 'Captura el nombre del municipio'),
  state: z.string().min(3, 'Captura el estado'),
  adminName: z.string().min(3, 'Captura el nombre del administrador'),
  email: z.string().email('Correo inválido'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function RegisterMunicipioPage() {
  const { registerMunicipio } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await registerMunicipio(data);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo registrar el municipio');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Crear municipio piloto</h1>
          <p className="mt-2 text-slate-600">Se creará el municipio, el área inicial y el administrador municipal.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Municipio" {...register('municipioName')} error={errors.municipioName?.message} />
          <Input label="Estado" {...register('state')} error={errors.state?.message} />
          <Input label="Administrador" {...register('adminName')} error={errors.adminName?.message} />
          <Input label="Teléfono" {...register('phone')} error={errors.phone?.message} />
          <Input label="Correo" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Contraseña" type="password" {...register('password')} error={errors.password?.message} />
        </div>
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="flex items-center justify-between gap-3">
          <Link to="/login" className="text-sm font-medium text-brand-600">Ya tengo cuenta</Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear municipio'}</Button>
        </div>
      </form>
    </main>
  );
}
