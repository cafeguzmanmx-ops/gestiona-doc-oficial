import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';

type Area = {
  id: string;
  name: string;
  code?: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  _count?: { users: number };
};

type FormData = { name: string; code?: string; parentId?: string };

export function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>();

  const load = async () => {
    const response = await api.get<Area[]>('/areas');
    setAreas(response.data);
  };

  useEffect(() => { void load(); }, []);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await api.post('/areas', { ...data, parentId: data.parentId || undefined });
      reset();
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo crear el área');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Organigrama municipal</h1>
        <p className="mt-2 text-slate-600">Crea las áreas responsables de recibir turnos y atender oficios.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Nueva área</h2>
          <Input label="Nombre del área" {...register('name', { required: true })} />
          <Input label="Clave opcional" {...register('code')} placeholder="TESORERIA" />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Área superior</span>
            <select {...register('parentId')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">Sin superior</option>
              {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </label>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Crear área'}</Button>
        </form>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-950">Áreas activas</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-3">Área</th><th className="px-4 py-3">Clave</th><th className="px-4 py-3">Superior</th><th className="px-4 py-3">Usuarios</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {areas.map((area) => (
                  <tr key={area.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">{area.name}</td>
                    <td className="px-4 py-3 text-slate-600">{area.code ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{area.parent?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{area._count?.users ?? 0}</td>
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
