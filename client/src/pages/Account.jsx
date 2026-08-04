import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Account() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    city: '',
    email: '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        phone: user.phone || '',
        city: user.city || '',
        email: user.email || '',
      });
    }
  }, [user]);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.put('/users/me', profile);
      setUser(res.data);
      setMessage('Profil actualizat cu succes!');
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la actualizarea profilului');
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (passwords.new !== passwords.confirm) {
      setError('Parolele noi nu se potrivesc');
      return;
    }
    
    if (passwords.new.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }

    try {
      await api.post('/users/me/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setMessage('Parolă schimbată cu succes!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la schimbarea parolei');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="label-tag">contul meu</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Setări cont</h1>
      
      {message && <p className="mt-3 rounded-xl bg-green-100 px-3 py-2 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* Secțiunea 1: Informații personale */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Informații personale</h2>
        <form onSubmit={handleUpdateProfile} className="card p-5 space-y-4">
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Nume complet</label>
            <input
              type="text"
              className="input-field"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Email</label>
            <input
              type="email"
              className="input-field"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled
            />
            <p className="mt-1 text-xs text-ink-500">Email-ul nu poate fi modificat</p>
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Telefon</label>
            <input
              type="tel"
              className="input-field"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Oraș</label>
            <input
              type="text"
              className="input-field"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary">Salvează modificările</button>
        </form>
      </section>

      {/* Secțiunea 2: Schimbare parolă */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Schimbare parolă</h2>
        <form onSubmit={handleChangePassword} className="card p-5 space-y-4">
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Parola actuală</label>
            <input
              type="password"
              className="input-field"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Parola nouă</label>
            <input
              type="password"
              className="input-field"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Confirmă parola nouă</label>
            <input
              type="password"
              className="input-field"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn-primary">Schimbă parola</button>
        </form>
      </section>

      {/* Secțiunea 3: Informații cont */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Informații cont</h2>
        <div className="card p-5 space-y-2">
          <p className="text-sm text-ink-600">
            <span className="font-semibold">Rol:</span>{' '}
            <span className="label-tag">{user?.role === 'worker' ? 'Meseriaș' : 'Client'}</span>
          </p>
          <p className="text-sm text-ink-600">
            <span className="font-semibold">Membru din:</span>{' '}
            {new Date(user?.created_at).toLocaleDateString('ro-RO')}
          </p>
          {user?.role === 'worker' && (
            <p className="text-sm text-ink-600">
              <span className="font-semibold">Status:</span>{' '}
              <span className={user?.is_banned ? 'text-red-600' : 'text-green-600'}>
                {user?.is_banned ? 'Suspendat' : 'Activ'}
              </span>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
