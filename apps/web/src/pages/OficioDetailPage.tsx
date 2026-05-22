import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../lib/api';

type UserRef = { id: string; fullName: string; email?: string };
type AreaRef = { id: string; name: string };

type Archivo = {
  id: string;
  tipo: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  uploadedBy?: { id: string; fullName: string };
};

type Seguimiento = {
  id: string;
  comment: string;
  statusFrom?: string | null;
  statusTo?: string | null;
  createdAt: string;
  user: { id: string; fullName: string };
  archivos: Archivo[];
};

type OficioDetail = {
  id: string;
  folio: string;
  externalNumber?: string | null;
  receivedAt: string;
  senderName: string;
  senderAgency?: string | null;
  subject: string;
  description?: string | null;
  priority: string;
  dueAt?: string | null;
  status: string;
  createdAt: string;
  closedAt?: string | null;
  responsibleArea?: AreaRef | null;
  createdBy: UserRef;
  closedBy?: UserRef | null;
  archivos: Archivo[];
  seguimientos: Seguimiento[];
};

type SeguimientoForm = {
  comment: string;
  statusTo?: string;
  archivo?: FileList;
};

type CierreForm = {
  comment: string;
  archivo?: FileList;
};

const advanceStatuses = ['EN_PROCESO', 'ATENDIDO'];

export function OficioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [oficio, setOficio] = useState<OficioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const seguimientoForm = useForm<SeguimientoForm>();
  const cierreForm = useForm<CierreForm>();

  const load = async () => {
    if (!id) return;
    const response = await api.get<OficioDetail>(`/oficios/${id}`);
    setOficio(response.data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [id]);

  const addSeguimiento = async (data: SeguimientoForm) => {
    if (!id) return;
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('comment', data.comment);
    if (data.statusTo) formData.append('statusTo', data.statusTo);
    if (data.archivo?.[0]) formData.append('archivo', data.archivo[0]);

    try {
      await api.post(`/oficios/${id}/seguimientos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      seguimientoForm.reset({ comment: '', statusTo: '' });
      setSuccess('Seguimiento agregado correctamente.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo agregar el seguimiento');
    }
  };

  const closeOficio = async (data: CierreForm) => {
    if (!id) return;
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('comment', data.comment);
    if (data.archivo?.[0]) formData.append('archivo', data.archivo[0]);

    try {
      await api.post(`/oficios/${id}/cerrar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      cierreForm.reset({ comment: '' });
      setSuccess('Oficio cerrado correctamente.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo cerrar el oficio');
    }
  };

  const downloadArchivo = async (archivo: Archivo) => {
    const response = await api.get<Blob>(`/oficios/archivos/${archivo.id}/descargar`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivo.originalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <main className="mx-auto max-w-6xl px-6 py-8 text-slate-600">Cargando oficio...</main>;
  if (!oficio) return <main className="mx-auto max-w-6xl px-6 py-8 text-slate-600">Oficio no encontrado.</main>;

  const isClosed = oficio.status === 'CERRADO';

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <Link to="/app/oficios" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"><ArrowLeft className="h-4 w-4" /> Volver a bandeja</Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-950">{oficio.folio}</h1>
              <StatusBadge value={oficio.status} />
              <StatusBadge value={oficio.priority} type="priority" />
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-800">{oficio.subject}</p>
            <p className="mt-1 text-sm text-slate-500">Registrado por {oficio.createdBy.fullName} el {formatDateTime(oficio.createdAt)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p><strong className="text-slate-950">Área:</strong> {oficio.responsibleArea?.name ?? 'Sin turnar'}</p>
            <p><strong className="text-slate-950">Fecha límite:</strong> {formatDate(oficio.dueAt)}</p>
            {oficio.closedAt && <p><strong className="text-slate-950">Cierre:</strong> {formatDateTime(oficio.closedAt)}</p>}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Número externo" value={oficio.externalNumber ?? 'No capturado'} />
          <Info label="Recepción" value={formatDate(oficio.receivedAt)} />
          <Info label="Remitente" value={oficio.senderName} />
          <Info label="Dependencia remitente" value={oficio.senderAgency ?? 'No capturada'} />
        </div>

        {oficio.description && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-950">Descripción</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{oficio.description}</p>
          </div>
        )}
      </section>

      {(error || success) && (
        <div className={`mt-5 rounded-2xl p-4 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{error ?? success}</div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Historial de seguimiento</h2>
          <div className="mt-5 space-y-4">
            {oficio.seguimientos.map((seguimiento) => (
              <article key={seguimiento.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-slate-950">{seguimiento.user.fullName}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(seguimiento.createdAt)}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{seguimiento.comment}</p>
                {(seguimiento.statusFrom || seguimiento.statusTo) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {seguimiento.statusFrom && <StatusBadge value={seguimiento.statusFrom} />}
                    {seguimiento.statusTo && <span>→</span>}
                    {seguimiento.statusTo && <StatusBadge value={seguimiento.statusTo} />}
                  </div>
                )}
                {seguimiento.archivos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {seguimiento.archivos.map((archivo) => <ArchivoRow key={archivo.id} archivo={archivo} onDownload={() => void downloadArchivo(archivo)} />)}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Archivos del oficio</h2>
            <div className="mt-4 space-y-2">
              {oficio.archivos.length === 0 ? <p className="text-sm text-slate-500">No hay archivos adjuntos.</p> : oficio.archivos.map((archivo) => <ArchivoRow key={archivo.id} archivo={archivo} onDownload={() => void downloadArchivo(archivo)} />)}
            </div>
          </section>

          {!isClosed && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-950">Agregar seguimiento</h2>
              <form onSubmit={seguimientoForm.handleSubmit(addSeguimiento)} className="mt-4 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Comentario de avance</span>
                  <textarea {...seguimientoForm.register('comment', { required: true })} rows={4} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Cambiar estatus</span>
                  <select {...seguimientoForm.register('statusTo')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100">
                    <option value="">Mantener estatus actual</option>
                    {advanceStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">PDF de soporte opcional</span>
                  <input type="file" accept="application/pdf" {...seguimientoForm.register('archivo')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
                </label>
                <Button type="submit" disabled={seguimientoForm.formState.isSubmitting}>Guardar avance</Button>
              </form>
            </section>
          )}

          {!isClosed && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-950">Cerrar oficio</h2>
              <p className="mt-1 text-sm text-slate-500">Registra el comentario final y adjunta la respuesta si aplica.</p>
              <form onSubmit={cierreForm.handleSubmit(closeOficio)} className="mt-4 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Comentario de cierre</span>
                  <textarea {...cierreForm.register('comment', { required: true })} rows={4} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">PDF de respuesta opcional</span>
                  <input type="file" accept="application/pdf" {...cierreForm.register('archivo')} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
                </label>
                <Button type="submit" disabled={cierreForm.formState.isSubmitting}>Cerrar oficio</Button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-950">{value}</p></div>;
}

function ArchivoRow({ archivo, onDownload }: { archivo: Archivo; onDownload: () => void }) {
  return (
    <button type="button" onClick={onDownload} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm transition hover:bg-slate-100">
      <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-brand-600" /><span className="truncate"><strong>{archivo.tipo}</strong> · {archivo.originalName}</span></span>
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-brand-600"><Download className="h-4 w-4" /> {formatBytes(archivo.sizeBytes)}</span>
    </button>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
