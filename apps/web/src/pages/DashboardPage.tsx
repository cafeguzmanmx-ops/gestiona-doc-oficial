import { ReactNode, useEffect, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, Clock3, FileText, Timer, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

type DashboardSummary = {
  total: number;
  pendientes: number;
  vencidos: number;
  cerrados: number;
  atendidos: number;
  proximos: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  byArea: { areaId: string | null; areaName: string; count: number }[];
  recent: {
    id: string;
    folio: string;
    subject: string;
    status: string;
    priority: string;
    dueAt?: string | null;
    responsibleArea?: { id: string; name: string } | null;
  }[];
};

const emptySummary: DashboardSummary = {
  total: 0,
  pendientes: 0,
  vencidos: 0,
  cerrados: 0,
  atendidos: 0,
  proximos: 0,
  byStatus: [],
  byPriority: [],
  byArea: [],
  recent: [],
};

export function DashboardPage() {
  const { user, tenant } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      setLoading(false);
      return;
    }

    const load = async () => {
      const response = await api.get<DashboardSummary>('/oficios/dashboard/resumen');
      setSummary(response.data);
      setLoading(false);
    };
    void load();
  }, [user?.role]);

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-brand-600">Panel SaaS interno</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Administración de Gestiona Doc</h1>
          <p className="mt-2 text-slate-600">Controla municipios registrados, vigencias de suscripción anual, activaciones y suspensiones.</p>
          <Link to="/app/admin/municipios" className="mt-5 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">Gestionar municipios</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand-600">{tenant?.status === 'TRIAL' ? 'Trial activo' : tenant?.status}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Panel municipal</h1>
        <p className="mt-2 text-slate-600">
          Bienvenido, {user?.fullName}. Aquí se concentra el estado operativo de la correspondencia oficial del municipio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card icon={<FileText />} title="Total oficios" value={String(summary.total)} text="Registrados" to="/app/oficios" />
        <Card icon={<Clock3 />} title="Pendientes" value={String(summary.pendientes)} text="Por atender" />
        <Card icon={<AlertTriangle />} title="Vencidos" value={String(summary.vencidos)} text="Fuera de plazo" danger />
        <Card icon={<Timer />} title="Por vencer" value={String(summary.proximos)} text="Próx. 7 días" />
        <Card icon={<CheckCircle2 />} title="Cerrados" value={String(summary.cerrados)} text="Concluidos" />
        <Card icon={<Users />} title="Usuarios" value="Gestionar" text="Roles y accesos" to="/app/usuarios" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-950">Actividad reciente</h2>
              <p className="text-sm text-slate-500">Últimos oficios capturados o actualizados.</p>
            </div>
            <Link to="/app/oficios" className="text-sm font-semibold text-brand-600">Ver bandeja</Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Cargando indicadores...</p>
          ) : summary.recent.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Todavía no hay oficios registrados.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr><th className="px-4 py-3">Folio</th><th className="px-4 py-3">Asunto</th><th className="px-4 py-3">Área</th><th className="px-4 py-3">Estatus</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {summary.recent.map((oficio) => (
                    <tr key={oficio.id}>
                      <td className="px-4 py-3 font-semibold text-brand-600"><Link to={`/app/oficios/${oficio.id}`}>{oficio.folio}</Link></td>
                      <td className="px-4 py-3"><div className="font-medium text-slate-950">{oficio.subject}</div><div className="text-slate-500">{formatDate(oficio.dueAt)}</div></td>
                      <td className="px-4 py-3 text-slate-600">{oficio.responsibleArea?.name ?? 'Sin turnar'}</td>
                      <td className="px-4 py-3"><StatusBadge value={oficio.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Distribución por área</h2>
            <div className="mt-4 space-y-3">
              {summary.byArea.length === 0 ? <p className="text-sm text-slate-500">Sin información por área.</p> : summary.byArea.map((item) => (
                <div key={item.areaId ?? 'sin-area'}>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">{item.areaName}</span><strong>{item.count}</strong></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${percent(item.count, summary.total)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <MiniPanel icon={<Building2 />} title="Organigrama" text="Mantén áreas y responsables actualizados." to="/app/areas" />
            <MiniPanel icon={<FileText />} title="Captura documental" text="Registra un nuevo oficio recibido." to="/app/oficios" />
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ icon, title, value, text, to, danger }: { icon: ReactNode; title: string; value: string; text: string; to?: string; danger?: boolean }) {
  const content = (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`mb-4 inline-flex rounded-2xl p-3 [&_svg]:h-5 [&_svg]:w-5 ${danger ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-brand-600'}`}>{icon}</div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

function MiniPanel({ icon, title, text, to }: { icon: ReactNode; title: string; text: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="rounded-2xl bg-blue-50 p-3 text-brand-600 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <div><p className="font-semibold text-slate-950">{title}</p><p className="text-sm text-slate-600">{text}</p></div>
    </Link>
  );
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.max(5, Math.round((value / total) * 100));
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha límite';
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
