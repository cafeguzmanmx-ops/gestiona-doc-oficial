import { clsx } from 'clsx';

const statusClass: Record<string, string> = {
  RECIBIDO: 'bg-slate-100 text-slate-700',
  TURNADO: 'bg-blue-50 text-brand-600',
  EN_PROCESO: 'bg-amber-50 text-amber-700',
  ATENDIDO: 'bg-emerald-50 text-emerald-700',
  CERRADO: 'bg-green-50 text-green-700',
  VENCIDO: 'bg-red-50 text-red-700',
};

const priorityClass: Record<string, string> = {
  BAJA: 'bg-slate-100 text-slate-600',
  MEDIA: 'bg-blue-50 text-brand-600',
  ALTA: 'bg-amber-50 text-amber-700',
  URGENTE: 'bg-red-50 text-red-700',
};

export function StatusBadge({ value, type = 'status' }: { value: string; type?: 'status' | 'priority' }) {
  const classes = type === 'priority' ? priorityClass : statusClass;
  return (
    <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', classes[value] ?? 'bg-slate-100 text-slate-700')}>
      {value.replace('_', ' ')}
    </span>
  );
}
