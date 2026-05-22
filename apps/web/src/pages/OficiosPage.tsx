import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';

type Area = { id: string; name: string };
type Oficio = {
  id: string;
  folio: string;
  externalNumber?: string;
  receivedAt: string;
  senderName: string;
  senderAgency?: string;
  subject: string;
  priority: string;
  dueAt?: string;
  status: string;
  responsibleArea?: Area | null;
  _count?: { archivos: number; seguimientos: number };
};

type FormData = {
  externalNumber?: string;
  receivedAt: string;
  senderName: string;
  senderAgency?: string;
  subject: string;
  description?: string;
  priority: string;
  dueAt?: string;
  responsibleAreaId?: string;
  archivo?: FileList;
};

const priorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];
const statuses = ['RECIBIDO', 'TURNADO', 'EN_PROCESO', 'ATENDIDO', 'CERRADO', 'VENCIDO'];

export function OficiosPage() {
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', areaId: '', search: '' });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { priority: 'MEDIA', receivedAt: new Date().toISOString().slice(0, 10) },
  });

  const load = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.areaId) params.set('areaId', filters.areaId);
    if (filters.search) params.set('search', filters.search);

    const [oficiosResponse, areasResponse] = await Promise.all([
      api.get<Oficio[]>(`/oficios${params.toString() ? `?${params.toString()}` : ''}`),
      api.get<Area[]>('/areas'),
    ]);
    setOficios(oficiosResponse.data);
    setAreas(areasResponse.data);
  };

  useEffect(() => { void load(); }, [filters.status, filters.areaId]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    const formData = new FormData();
    formData.append('receivedAt', data.receivedAt);
    formData.append('senderName', data.senderName);
    formData.append('subject', data.subject);
    formData.append('priority', data.priority);
    if (data.externalNumber) formData.append('externalNumber', data.externalNumber);
    if (data.senderAgency) formData.append('senderAgency', data.senderAgency);
    if (data.description) formData.append('description', data.description);
    if (data.dueAt) formData.append('dueAt', data.dueAt);
    if (data.responsibleAreaId) formData.append('responsibleAreaId', data.responsibleAreaId);
    if (data.archivo?.[0]) formData.append('archivo', data.archivo[0]);

    try {
      await api.post('/oficios', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      reset({ priority: 'MEDIA', receivedAt: new Date().toISOString().slice(0, 10) });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo registrar el oficio');
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Oficios recibidos</h1>
        <p className="mt-2 text-slate-600">Registra correspondencia oficial, adjunta PDF y turna al área responsable.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Nuevo oficio</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <Input label="Fecha de recepción" type="date" {...register('receivedAt', { required: true })} />
            <Input label="Número de oficio externo" {...register('externalNumber')} placeholder="OP/123/2026" />
            <Input label="Remitente" {...register('senderName', { required: true })} />
            <Input label="Dependencia remitente" {...register('senderAgency')} />
            <Input label="Asunto" {...register('subject', { required: true })} />
            <Input label="Fecha límite" type="date" {...register('dueAt')} />
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Prioridad</span>
            <select {...register('priority')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Área responsable</span>
            <select {...register('responsibleAreaId')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">Sin turnar todavía</option>
              {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Descripción</span>
            <textarea {...register('description')} rows={3} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">PDF del oficio</span>
            <input type="file" accept="application/pdf" {...register('archivo')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
          </label>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Registrando...' : 'Registrar oficio'}</Button>
        </form>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">Bandeja de oficios</h2>
              <p className="text-sm text-slate-500">Consulta, filtra y entra al detalle de cada documento.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                <option value="">Todos los estatus</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <select value={filters.areaId} onChange={(event) => setFilters((current) => ({ ...current, areaId: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                <option value="">Todas las áreas</option>
                {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Buscar por folio, asunto, remitente o dependencia" className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
            </div>
            <Button type="button" variant="secondary" onClick={() => void load()}>Buscar</Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-3">Folio</th><th className="px-4 py-3">Asunto</th><th className="px-4 py-3">Área</th><th className="px-4 py-3">Fecha límite</th><th className="px-4 py-3">Prioridad</th><th className="px-4 py-3">Estatus</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {oficios.map((oficio) => (
                  <tr key={oficio.id}>
                    <td className="px-4 py-3 font-semibold text-brand-600"><Link to={`/app/oficios/${oficio.id}`}>{oficio.folio}</Link></td>
                    <td className="px-4 py-3"><div className="font-medium text-slate-950">{oficio.subject}</div><div className="text-slate-500">{oficio.senderName}</div></td>
                    <td className="px-4 py-3 text-slate-600">{oficio.responsibleArea?.name ?? 'Sin turnar'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(oficio.dueAt)}</td>
                    <td className="px-4 py-3"><StatusBadge value={oficio.priority} type="priority" /></td>
                    <td className="px-4 py-3"><StatusBadge value={oficio.status} /></td>
                  </tr>
                ))}
                {oficios.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hay oficios con los filtros actuales.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin plazo';
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
