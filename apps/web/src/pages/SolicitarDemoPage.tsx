import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';

type FormState = {
  municipioName: string;
  state: string;
  contactName: string;
  position: string;
  email: string;
  phone: string;
  estimatedUsers: string;
  message: string;
};

const initialState: FormState = {
  municipioName: '',
  state: '',
  contactName: '',
  position: '',
  email: '',
  phone: '',
  estimatedUsers: '',
  message: '',
};

export function SolicitarDemoPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        estimatedUsers: form.estimatedUsers ? Number(form.estimatedUsers) : undefined,
        source: 'landing-publica',
      };
      const response = await api.post('/contacto/solicitar-demo', payload);
      setSuccess(response.data.message ?? 'Solicitud recibida.');
      setForm(initialState);
    } catch {
      setError('No fue posible registrar la solicitud. Revisa los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Volver a inicio</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section className="space-y-5">
            <p className="text-sm font-semibold text-brand-600">Demo comercial</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">Solicita una demostración de Gestiona Doc.</h1>
            <p className="leading-7 text-slate-600">
              Registra los datos del municipio o área interesada. La demo está pensada para mostrar el flujo completo: recepción, turnado, seguimiento, vencimientos, cierre y reportes.
            </p>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-950">La demo incluye:</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {['Municipio demo con usuarios y áreas', 'Oficios en distintos estatus', 'Dashboard, reportes y alertas', 'Panel SaaS para suscripción anual'].map((item) => (
                  <li key={item} className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600" /> {item}</li>
                ))}
              </ul>
            </div>
          </section>

          <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-100">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Municipio o dependencia" required value={form.municipioName} onChange={(e) => update('municipioName', e.target.value)} />
              <Input label="Estado" required value={form.state} onChange={(e) => update('state', e.target.value)} />
              <Input label="Nombre de contacto" required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} />
              <Input label="Cargo" value={form.position} onChange={(e) => update('position', e.target.value)} />
              <Input label="Correo" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
              <Input label="Teléfono" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              <Input label="Usuarios estimados" type="number" min="1" value={form.estimatedUsers} onChange={(e) => update('estimatedUsers', e.target.value)} />
            </div>
            <label className="mt-4 block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Mensaje o necesidad principal</span>
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                placeholder="Ejemplo: queremos controlar oficios recibidos en Secretaría del Ayuntamiento y reportar vencimientos."
              />
            </label>
            {success && <div className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-700">{success}</div>}
            {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            <Button type="submit" disabled={loading} className="mt-5 w-full">{loading ? 'Enviando...' : 'Enviar solicitud de demo'}</Button>
          </form>
        </div>
      </div>
    </main>
  );
}
