import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import StarRating from '../components/StarRating';

export default function WorkerProfile() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/workers/${id}`)
      .then((res) => setWorker(res.data))
      .catch(() => setError('Meseriaș inexistent.'));
  }, [id]);

  if (error) return <p className="mx-auto max-w-3xl px-6 py-16 text-ink-500">{error}</p>;
  if (!worker) return <p className="mx-auto max-w-3xl px-6 py-16 text-ink-500">Se încarcă…</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start gap-5">
        <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-ink-800 font-display text-2xl font-semibold text-brass-300">
          {worker.full_name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-ink-800">{worker.full_name}</h1>
            {worker.verified && <span className="label-tag rounded-full bg-brass-100 px-2.5 py-1">verificat</span>}
          </div>
          {worker.headline && <p className="mt-1 text-ink-600">{worker.headline}</p>}
          <div className="mt-2 flex items-center gap-3 text-sm text-ink-500">
            <StarRating value={worker.avg_rating} count={worker.review_count} />
            {worker.city && <span>· {worker.city}</span>}
          </div>
        </div>
      </div>

      {worker.categories?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {worker.categories.map((c) => (
            <span key={c} className="rounded-full bg-ink-50 px-3 py-1 font-mono text-xs text-ink-600">{c}</span>
          ))}
        </div>
      )}

      {worker.bio && (
        <div className="mt-8">
          <p className="label-tag">despre</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-700">{worker.bio}</p>
        </div>
      )}

      <div className="mt-10">
        <p className="label-tag">recenzii ({worker.reviews.length})</p>
        {worker.reviews.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">Încă nu are recenzii.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {worker.reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-ink-800">{r.reviewer_name}</span>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-10 rounded-2xl border border-dashed border-ink-700/20 p-4 text-sm text-ink-500">
        Pentru a contacta acest meseriaș, postează o cerere de serviciu din contul tău de client — meseriașii din zonă vor putea trimite oferte.
      </p>
    </div>
  );
}
