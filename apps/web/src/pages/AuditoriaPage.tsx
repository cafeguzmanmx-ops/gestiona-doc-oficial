import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../components/Button';
import { api } from '../lib/api';

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string; role: string } | null;
  tenant?: { id: string; name: string; slug: string; status: string } | null;
};

const actionLabels: Record<string, string> = {
  TENANT_CREATED: 'Municipio creado',
  TENANT_UPDATED: 'Municipio actualizado',
  USER_CREATED: 'Usuario creado',
  USER_UPDATED: 'Usuario actualizado',
  USER_DEACTIVATED: 'Usuario desactivado',
  USER_LOGIN: 'Inicio de sesión',
  USER_LOGIN_FAILED: 'Inicio fallido',
  AREA_CREATED: 'Área creada',
  AREA_UPDATED: 'Área actualizada',
  AREA_DEACTIVATED: 'Área desactivada',
  OFICIO_CREATED: 'Oficio creado',
  OFICIO_VIEWED: 'Oficio consultado',
  OFICIO_STATUS_CHANGED: 'Cambio de estatus',
  OFICIO_CLOSED: 'Oficio cerrado',
  OFICIO_FILE_DOWNLOADED: 'Archivo descargado',
  SEGUIMIENTO_CREATED: 'Seguimiento agregado',
  SUBSCRIPTION_CREATED: 'Suscripción creada',
  SUBSCRIPTION_UPDATED: 'Suscripción actualizada',
  DEMO_DATA_CREATED: 'Datos demo creados',
  SECURITY_ACCESS_DENIED: 'Acceso denegado',
};

export function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const response = await api.get<AuditLog[]>('/auditoria?limit=150');
    setLogs(response.data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-brand-600">Trazabilidad</p>
          <h1 className="text-3xl font-bold text-slate-950">Bitácora de auditoría</h1>
          <p className="mt-2 text-slate-600">Consulta las acciones críticas registradas en el sistema.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void load()}><RefreshCw className="mr-2 h-4 w-4" /> Actualizar</Button>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? <p className="text-sm text-slate-500">Cargando bitácora...</p> : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Municipio</th>
                  <th className="px-4 py-3">Entidad</th>
                  <th className="px-4 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-950">{actionLabels[log.action] ?? log.action}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{log.user?.fullName ?? 'Sistema'}</div>
                      <div className="text-xs text-slate-400">{log.user?.email ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.tenant?.name ?? 'SaaS'}</td>
                    <td className="px-4 py-3 text-slate-600">{log.entity}{log.entityId ? <span className="block text-xs text-slate-400">{log.entityId}</span> : null}</td>
                    <td className="max-w-md px-4 py-3 text-xs text-slate-500">
                      <pre className="whitespace-pre-wrap break-words font-sans">{formatMetadata(log.metadata)}</pre>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hay eventos de auditoría registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

function formatMetadata(value: unknown) {
  if (!value) return '—';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
