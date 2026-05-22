import { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, FileText, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';

type Area = { id: string; name: string };
type ReportData = {
  tenant: { name: string; state: string } | null;
  summary: {
    total: number;
    recibidos: number;
    turnados: number;
    enProceso: number;
    atendidos: number;
    cerrados: number;
    vencidos: number;
  };
  oficios: {
    id: string;
    folio: string;
    externalNumber?: string | null;
    receivedAt: string;
    senderName: string;
    senderAgency?: string | null;
    subject: string;
    priority: string;
    status: string;
    dueAt?: string | null;
    responsibleArea?: Area | null;
    _count: { archivos: number; seguimientos: number };
  }[];
};

type Filters = {
  from: string;
  to: string;
  status: string;
  areaId: string;
  priority: string;
  search: string;
};

const statuses = ['RECIBIDO', 'TURNADO', 'EN_PROCESO', 'ATENDIDO', 'CERRADO', 'VENCIDO'];
const priorities = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

export function ReportesPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<Filters>({ from: '', to: '', status: '', areaId: '', priority: '', search: '' });
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const load = async () => {
    setLoading(true);
    const [areasResponse, reportResponse] = await Promise.all([
      api.get<Area[]>('/areas'),
      api.get<ReportData>(`/reportes/oficios${query ? `?${query}` : ''}`),
    ]);
    setAreas(areasResponse.data);
    setReport(reportResponse.data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const download = async (type: 'excel' | 'pdf') => {
    const response = await api.get<Blob>(`/reportes/oficios/${type}${query ? `?${query}` : ''}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-oficios-${new Date().toISOString().slice(0, 10)}.${type === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Reportes</h1>
          <p className="mt-2 text-slate-600">Exporta el control de oficios a Excel o PDF para revisión directiva.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void download('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button type="button" variant="secondary" onClick={() => void download('pdf')}><FileText className="mr-2 h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">Filtros del reporte</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Input label="Desde" type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} />
          <Input label="Hasta" type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Estatus</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">Todos</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Prioridad</span>
            <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">Todas</option>
              {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </label>
          <label className="block space-y-1.5 xl:col-span-2">
            <span className="text-sm font-medium text-slate-700">Área</span>
            <select value={filters.areaId} onChange={(event) => setFilters((current) => ({ ...current, areaId: event.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
              <option value="">Todas las áreas</option>
              {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Buscar por folio, asunto o remitente" className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
          </div>
          <Button type="button" onClick={() => void load()}><Download className="mr-2 h-4 w-4" /> Aplicar</Button>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Summary label="Total" value={report?.summary.total ?? 0} />
        <Summary label="Recibidos" value={report?.summary.recibidos ?? 0} />
        <Summary label="Turnados" value={report?.summary.turnados ?? 0} />
        <Summary label="En proceso" value={report?.summary.enProceso ?? 0} />
        <Summary label="Atendidos" value={report?.summary.atendidos ?? 0} />
        <Summary label="Cerrados" value={report?.summary.cerrados ?? 0} />
        <Summary label="Vencidos" value={report?.summary.vencidos ?? 0} danger />
      </div>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-950">Resultado del reporte</h2>
        {loading ? <p className="text-sm text-slate-500">Cargando reporte...</p> : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="px-4 py-3">Folio</th><th className="px-4 py-3">Asunto</th><th className="px-4 py-3">Remitente</th><th className="px-4 py-3">Área</th><th className="px-4 py-3">Prioridad</th><th className="px-4 py-3">Estatus</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(report?.oficios ?? []).map((oficio) => (
                  <tr key={oficio.id}>
                    <td className="px-4 py-3 font-semibold text-slate-950">{oficio.folio}</td>
                    <td className="px-4 py-3"><div className="font-medium text-slate-950">{oficio.subject}</div><div className="text-slate-500">{formatDate(oficio.receivedAt)}</div></td>
                    <td className="px-4 py-3 text-slate-600">{oficio.senderName}</td>
                    <td className="px-4 py-3 text-slate-600">{oficio.responsibleArea?.name ?? 'Sin turnar'}</td>
                    <td className="px-4 py-3"><StatusBadge value={oficio.priority} type="priority" /></td>
                    <td className="px-4 py-3"><StatusBadge value={oficio.status} /></td>
                  </tr>
                ))}
                {(report?.oficios.length ?? 0) === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hay datos para los filtros seleccionados.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Summary({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${danger ? 'text-red-700' : 'text-slate-950'}`}>{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
