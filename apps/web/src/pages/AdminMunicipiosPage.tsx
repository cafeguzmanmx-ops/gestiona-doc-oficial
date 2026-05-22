import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';

type Municipio = {
  id: string;
  name: string;
  slug: string;
  state: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  createdAt: string;
  subscription: {
    id: string;
    planCode: string;
    status: string;
    trialEndsAt: string;
    currentPeriodEndsAt?: string | null;
    annualPriceCentsMx?: number | null;
  } | null;
  counts: { users: number; areas: number; oficios: number };
};

export function AdminMunicipiosPage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await api.get<Municipio[]>('/admin/municipios');
    setMunicipios(response.data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const activateAnnual = async (municipio: Municipio) => {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await api.patch(`/admin/municipios/${municipio.id}/suscripcion`, {
      status: 'ACTIVE',
      planCode: 'MUNICIPAL_ANNUAL',
      currentPeriodEndsAt: expiresAt.toISOString(),
      annualPriceCentsMx: 2400000,
    });
    setMessage(`${municipio.name} quedó activo por 12 meses.`);
    await load();
  };


  const createDemo = async () => {
    const response = await api.post('/demo/municipio');
    setMessage(response.data.message ?? 'Municipio demo preparado.');
    await load();
  };

  const suspend = async (municipio: Municipio) => {
    await api.patch(`/admin/municipios/${municipio.id}/suscripcion`, {
      status: 'SUSPENDED',
      planCode: municipio.subscription?.planCode ?? 'MUNICIPAL_ANNUAL',
      currentPeriodEndsAt: municipio.subscription?.currentPeriodEndsAt ?? new Date().toISOString(),
      annualPriceCentsMx: municipio.subscription?.annualPriceCentsMx ?? 2400000,
    });
    setMessage(`${municipio.name} fue suspendido.`);
    await load();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-brand-600">Panel SaaS interno</p>
          <h1 className="text-3xl font-bold text-slate-950">Municipios y suscripciones</h1>
          <p className="mt-2 text-slate-600">Controla altas, vigencias y suspensión de municipios bajo suscripción anual.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void createDemo()}>Crear demo comercial</Button>
      </div>

      {message && <div className="mb-5 rounded-2xl bg-green-50 p-4 text-sm text-green-700">{message}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? <p className="text-sm text-slate-500">Cargando municipios...</p> : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Municipio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Suscripción</th>
                  <th className="px-4 py-3">Vigencia</th>
                  <th className="px-4 py-3">Uso</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {municipios.map((municipio) => (
                  <tr key={municipio.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-950">{municipio.name}</div>
                      <div className="text-slate-500">{municipio.email ?? municipio.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{municipio.state}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge value={municipio.status} />
                        <span className="text-xs text-slate-500">{municipio.subscription?.planCode ?? 'Sin plan'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {municipio.subscription?.currentPeriodEndsAt ? formatDate(municipio.subscription.currentPeriodEndsAt) : `Trial: ${formatDate(municipio.subscription?.trialEndsAt)}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{municipio.counts.users} usuarios</div>
                      <div>{municipio.counts.areas} áreas · {municipio.counts.oficios} oficios</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => void activateAnnual(municipio)}>Activar anual</Button>
                        <Button type="button" variant="ghost" onClick={() => void suspend(municipio)}>Suspender</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {municipios.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Todavía no hay municipios registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin vigencia';
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
