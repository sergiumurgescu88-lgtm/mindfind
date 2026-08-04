import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/client');
    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut te autentifica.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="label-tag">autentificare</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Bine ai revenit</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Parolă</label>
          <input
            type="password"
            required
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Se conectează…' : 'Intră în cont'}
        </button>
      </form>
      <p className="mt-6 text-sm text-ink-600">
        Nu ai cont? <Link to="/register" className="font-semibold text-brass-600 hover:underline">Creează unul</Link>
      </p>
    </div>
  );
}
