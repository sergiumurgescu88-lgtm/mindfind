import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [profile, setProfile] = useState({ headline: '', bio: '', category_ids: [] });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
    api.get(`/workers/${user.id}`).then((res) =>
      setProfile({
        headline: res.data.headline || '',
        bio: res.data.bio || '',
        category_ids: [],
      })
    );
  }, [user.id]);

  function toggleCategory(id) {
    setProfile((p) => ({
      ...p,
      category_ids: p.category_ids.includes(id)
        ? p.category_ids.filter((c) => c !== id)
        : [...p.category_ids, id],
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    await api.put('/workers/me/profile', profile);
    setMessage('Profil actualizat.');
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="label-tag">contul meu · meseriaș</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Profilul meu public</h1>
      {message && <p className="mt-3 rounded-xl bg-brass-100/70 px-3 py-2 text-sm text-brass-700">{message}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Titlu scurt</label>
          <input placeholder="ex. Electrician autorizat, 8 ani experiență" className="input-field"
            value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Despre tine</label>
          <textarea rows={4} className="input-field" value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Categorii de servicii</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button type="button" key={c.id} onClick={() => toggleCategory(c.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  profile.category_ids.includes(c.id)
                    ? 'border-brass-500 bg-brass-100 text-brass-700'
                    : 'border-ink-700/15 text-ink-600'
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary">Salvează profilul</button>
      </form>
    </div>
  );
}
