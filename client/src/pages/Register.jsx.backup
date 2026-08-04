import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: params.get('role') === 'worker' ? 'worker' : 'client',
    city: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'worker' ? '/worker' : '/client');
    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut crea contul.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="label-tag">cont nou</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Creează-ți contul</h1>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {['client', 'worker'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setForm({ ...form, role: r })}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              form.role === r ? 'border-brass-500 bg-brass-100/60' : 'border-ink-700/15'
            }`}
          >
            <span className="block font-display text-sm font-semibold text-ink-800">
              {r === 'client' ? 'Caut un meseriaș' : 'Sunt meseriaș'}
            </span>
            <span className="text-xs text-ink-500">
              {r === 'client' ? 'Postez cereri de servicii' : 'Ofer servicii, primesc cereri'}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Nume complet</label>
          <input required className="input-field" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Email</label>
          <input type="email" required className="input-field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Parolă</label>
          <input type="password" required minLength={6} className="input-field" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Oraș</label>
            <input className="input-field" value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Telefon</label>
            <input className="input-field" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Se creează…' : 'Creează cont'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-600">
        Ai deja cont? <Link to="/login" className="font-semibold text-brass-600 hover:underline">Autentifică-te</Link>
      </p>
    </div>
  );
}
