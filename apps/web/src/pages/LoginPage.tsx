import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'Captura tu contraseña'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const response = await login(data);
      navigate(response.user.role === 'SUPER_ADMIN' ? '/app/admin/municipios' : '/app/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo iniciar sesión');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Ingresar</h1>
          <p className="mt-2 text-slate-600">Accede al panel municipal de Gestiona Doc.</p>
        </div>
        <Input label="Correo" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Contraseña" type="password" {...register('password')} error={errors.password?.message} />
        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Validando...' : 'Entrar'}</Button>
        <p className="text-center text-sm text-slate-600">¿No tienes municipio? <Link to="/registro" className="font-medium text-brand-600">Crear piloto</Link></p>
      </form>
    </main>
  );
}
