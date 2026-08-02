import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const STEPS = [
  { mark: 'A', title: 'Descrie ce ai de reparat', text: 'Alegi categoria, orașul și scrii pe scurt ce trebuie făcut.' },
  { mark: 'B', title: 'Primești oferte reale', text: 'Meseriașii din zonă îți trimit preț și disponibilitate.' },
  { mark: 'C', title: 'Alegi și discuți direct', text: 'Chat în aplicație, fără numere ascunse sau intermediari.' },
  { mark: 'D', title: 'Lași o recenzie dublă', text: 'Tu evaluezi meseriașul, el te evaluează pe tine. Încredere pe ambele sensuri.' },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div>
      {/* HERO — blueprint grid, ink background */}
      <section className="relative overflow-hidden bg-ink-800 text-paper">
        <div className="absolute inset-0 bg-blueprint bg-grid opacity-40" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brass-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <p className="label-tag mb-4">planșă de lucru — găsește meseriași</p>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            Repari, renovezi, construiești. <span className="text-brass-400">Găsești pe cine trebuie, o singură dată.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-ink-100/80 md:text-lg">
            Sergiu Mind Find pune față în față clienți și meseriași verificați din orașul tău:
            căutare rapidă, profiluri publice cu recenzii duble și chat direct în aplicație.
          </p>

          <form onSubmit={handleSearch} className="mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-3 backdrop-blur sm:flex-row">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field bg-ink-900 text-paper border-white/10 sm:w-56"
            >
              <option value="">Toate categoriile</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Oraș (ex. Cluj-Napoca)"
              className="input-field bg-ink-900 text-paper border-white/10"
            />
            <button type="submit" className="btn-primary sm:flex-none">Caută meseriași</button>
          </form>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-ink-100/60">
            <span>10 categorii de servicii</span>
            <span>·</span>
            <span>recenzii duble, verificabile</span>
            <span>·</span>
            <span>chat inclus, fără costuri ascunse</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — lettered sequence, since order matters here */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="label-tag">cum funcționează</p>
        <h2 className="mt-2 max-w-lg font-display text-2xl font-bold text-ink-800 md:text-3xl">
          Patru pași, de la problemă la meseriaș de încredere.
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-ink-700/10 bg-ink-700/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.mark} className="bg-paper p-6">
              <span className="font-mono text-xs text-brass-600">{s.mark}</span>
              <h3 className="mt-3 font-display text-base font-semibold text-ink-800">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-t border-ink-700/10 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="label-tag">categorii de servicii</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink-800 md:text-3xl">Ce cauți astăzi?</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/search?category=${c.slug}`)}
                className="card card-hover p-4 text-left hover:border-brass-500/40"
              >
                <span className="font-display text-sm font-semibold text-ink-800">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for workers */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="card flex flex-col items-start gap-6 rounded-2xl border-brass-500/30 bg-ink-800 p-10 text-paper md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label-tag">pentru meseriași</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Ai o meserie? Primești cereri direct din zona ta.</h2>
            <p className="mt-2 max-w-lg text-sm text-ink-100/70">
              Îți creezi profilul, alegi categoriile de servicii și primești cereri de la clienți reali — fără abonament ascuns.
            </p>
          </div>
          <button onClick={() => navigate('/register?role=worker')} className="btn-primary flex-none">
            Creează profil de meseriaș
          </button>
        </div>
      </section>
    </div>
  );
}
