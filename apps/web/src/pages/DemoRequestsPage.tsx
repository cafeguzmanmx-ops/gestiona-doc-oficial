import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';

type DemoStatus = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'WON' | 'LOST';

type DemoRequest = {
  id: string;
  municipioName: string;
  state: string;
  contactName: string;
  position?: string | null;
  email: string;
  phone?: string | null;
  estimatedUsers?: number | null;
  message?: string | null;
  source?: string | null;
  status: DemoStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

const statuses: DemoStatus[] = ['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'WON', 'LOST'];

export function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DemoStatus | ''>('');
  const [message, setMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const response = await api.get<DemoRequest[]>('/contacto/solicitudes-demo', { params: filter ? { status: filter } : {} });
    setRequests(response.data);
    setNotes(Object.fromEntries(response.data.map((item) => [item.id, item.notes ?? ''])));
    setLoading(false);
  };

  useEffect(() => { void load(); }, [filter]);

  const updateStatus = async (request: DemoRequest, status: DemoStatus) => {
    await api.patch(`/contacto/solicitudes-demo/${request.id}`, { status, notes: notes[request.id] ?? request.notes ?? '' });
    setMessage(`Solicitud de ${request.municipioName} actualizada a ${status.replace('_', ' ')}.`);
    await load();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Prospectos comerciales</p>
          <h1 className="text-3xl font-bold text-slate-950">Solicitudes de demo</h1>
          <p className="mt-2 text-slate-600">Da seguimiento a municipios interesados antes de convertirlos en clientes anuales.</p>
        </div>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Estatus
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" value={filter} onChange={(e) => setFilter(e.target.value as DemoStatus | '')}>
            <option value="">Todos</option>
            {statuses.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
          </select>
        </label>
      </div>

      {message && <div className="mb-5 rounded-2xl bg-green-50 p-4 text-sm text-green-700">{message}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? <p className="text-sm text-slate-500">Cargando solicitudes...</p> : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-950">{request.municipioName}</h2>
                      <StatusBadge value={request.status} />
                    </div>
                    <p className="text-sm text-slate-600">{request.state} · {request.contactName}{request.position ? ` · ${request.position}` : ''}</p>
                    <p className="text-sm text-slate-600">{request.email}{request.phone ? ` · ${request.phone}` : ''}</p>
                    <p className="text-sm text-slate-500">Usuarios estimados: {request.estimatedUsers ?? 'Sin dato'} · Fuente: {request.source ?? 'landing'}</p>
                    {request.message && <p className="max-w-3xl rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{request.message}</p>}
                  </div>
                  <div className="text-sm text-slate-500">{formatDate(request.createdAt)}</div>
                </div>
                <label className="mt-4 block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Notas comerciales internas</span>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                    value={notes[request.id] ?? ''}
                    onChange={(e) => setNotes((current) => ({ ...current, [request.id]: e.target.value }))}
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  {statuses.map((status) => <Button key={status} type="button" variant={request.status === status ? 'primary' : 'secondary'} onClick={() => void updateStatus(request, status)}>{status.replace('_', ' ')}</Button>)}
                </div>
              </article>
            ))}
            {requests.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No hay solicitudes con este filtro.</p>}
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
