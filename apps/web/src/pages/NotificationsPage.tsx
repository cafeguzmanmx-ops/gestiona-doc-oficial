import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, FileText, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
  oficio?: {
    id: string;
    folio: string;
    subject: string;
    status: string;
    dueAt?: string | null;
  } | null;
};

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await api.get<NotificationItem[]>('/notificaciones', { params: { unreadOnly } });
    setItems(response.data);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  const markAsRead = async (id: string) => {
    await api.patch(`/notificaciones/${id}/leida`);
    await load();
  };

  const markAll = async () => {
    await api.patch('/notificaciones/marcar-todas-leidas');
    await load();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand-600">Alertas internas</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Notificaciones</h1>
        <p className="mt-2 text-slate-600">Avisos de asignación, próximos vencimientos, oficios vencidos y cierres documentales.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant={unreadOnly ? 'secondary' : 'primary'} onClick={() => setUnreadOnly(false)}>Todas</Button>
          <Button variant={unreadOnly ? 'primary' : 'secondary'} onClick={() => setUnreadOnly(true)}>No leídas</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={load}><RefreshCcw className="mr-2 h-4 w-4" /> Actualizar</Button>
          <Button variant="secondary" onClick={markAll}><CheckCircle2 className="mr-2 h-4 w-4" /> Marcar todas</Button>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Cargando notificaciones...</p>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-600"><Bell className="h-6 w-6" /></div>
            <h2 className="font-semibold text-slate-950">Sin notificaciones</h2>
            <p className="mt-1 text-sm text-slate-500">Cuando existan oficios por vencer, vencidos o asignados, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <article key={item.id} className={`p-5 ${item.readAt ? 'bg-white' : 'bg-blue-50/40'}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tagClass(item.type)}`}>{labelType(item.type)}</span>
                      {!item.readAt && <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">Nueva</span>}
                      <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
                    </div>
                    <h2 className="mt-2 font-semibold text-slate-950">{item.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{item.message}</p>

                    {item.oficio && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm">
                        <FileText className="h-4 w-4 text-brand-600" />
                        <Link to={`/app/oficios/${item.oficio.id}`} className="font-semibold text-brand-600">{item.oficio.folio}</Link>
                        <span className="text-slate-500">{item.oficio.subject}</span>
                        <StatusBadge value={item.oficio.status} />
                      </div>
                    )}
                  </div>

                  {!item.readAt && (
                    <Button variant="secondary" onClick={() => markAsRead(item.id)}>Marcar leída</Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function labelType(type: string) {
  const labels: Record<string, string> = {
    OFICIO_ASIGNADO: 'Asignación',
    OFICIO_PROXIMO_VENCER: 'Por vencer',
    OFICIO_VENCIDO: 'Vencido',
    OFICIO_CERRADO: 'Cierre',
    SUSCRIPCION_PROXIMA_VENCER: 'Suscripción',
  };
  return labels[type] ?? type;
}

function tagClass(type: string) {
  if (type === 'OFICIO_VENCIDO') return 'bg-red-100 text-red-700';
  if (type === 'OFICIO_PROXIMO_VENCER') return 'bg-amber-100 text-amber-700';
  if (type === 'OFICIO_CERRADO') return 'bg-green-100 text-green-700';
  return 'bg-blue-100 text-brand-700';
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}
