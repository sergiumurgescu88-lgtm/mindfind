import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import WorkerCard from '../components/WorkerCard';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || '';
  const city = params.get('city') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get('/cities').then((res) => setCities(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/workers', { params: { category: category || undefined, city: city || undefined } })
      .then((res) => setWorkers(res.data))
      .finally(() => setLoading(false));
  }, [category, city]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <p className="label-tag">rezultate căutare</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Meseriași disponibili</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="input-field sm:w-64"
        >
          <option value="">Toate categoriile</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={city}
          onChange={(e) => updateParam('city', e.target.value)}
          className="input-field sm:w-64"
        >
          <option value="">Toate orașele</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-10 text-ink-500">Se caută…</p>
      ) : workers.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-700/20 p-10 text-center">
          <p className="font-display text-base font-semibold text-ink-700">Niciun meseriaș găsit</p>
          <p className="mt-1 text-sm text-ink-500">Încearcă alt oraș sau altă categorie.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {workers.map((w) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      )}
    </div>
  );
}
