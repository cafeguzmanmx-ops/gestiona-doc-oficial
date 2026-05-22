import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';

type Area = { id: string; name: string };
type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  position?: string;
  active: boolean;
  area?: Area | null;
};

type FormData = {
  fullName: string;
  email: string;
  password: string;
  role: string;
  position?: string;
  areaId?: string;
};

const roles = [
  { value: 'ADMIN_MUNICIPAL', label: 'Administrador municipal' },
  { value: 'DIRECTOR_AREA', label: 'Director de área' },
  { value: 'CAPTURISTA', label: 'Capturista' },
  { value: 'CONSULTA', label: 'Consulta' },
];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({ defaultValues: { role: 'CAPTURISTA' } });

  const load = async () => {
    const [usersResponse, areasResponse] = await Promise.all([api.get<User[]>('/users'), api.get<Area[]>('/areas')]);
    setUsers(usersResponse.data);
    setAreas(areasResponse.data);
  };

  useEffect(() => { void load(); }, []);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await api.post('/users', { ...data, areaId: data.areaId || undefined });
      reset({ role: 'CAPTURISTA' });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo crear el usuario');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Usuarios municipales</h1>
        <p className="mt-2 text-slate-600">Administra accesos internos por rol y área responsable.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Nuevo usuario</h2>
          <Input label="Nombre completo" {...register('fullName', { required: true })} />
          <Input label="Correo" type="email" {...register('email', { required: true })} />
          <Input label="Contraseña temporal" type="password" {...register('password', { required: true, minLength: 8 })} />
          <Input label="Cargo" {...register('position')} placeholder="Director de Obras Públicas" />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Rol</span>
            <select {...register('role')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Área</span>
            <select {...register('areaId')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">Sin área</option>
              {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </label>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Crear usuario'}</Button>
        </form>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-950">Usuarios registrados</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Área</th><th className="px-4 py-3">Estado</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3"><div className="font-medium text-slate-950">{user.fullName}</div><div className="text-slate-500">{user.email}</div></td>
                    <td className="px-4 py-3 text-slate-600">{user.role}</td>
                    <td className="px-4 py-3 text-slate-600">{user.area?.name ?? '-'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${user.active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{user.active ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
