import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function WorkerProfile() {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/workers/${id}`)
      .then((res) => setWorker(res.data))
      .catch((err) => setError('Nu am putut încărca profilul meseriașului'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="mx-auto max-w-4xl px-6 py-12 text-center">Se încarcă...</div>;
  if (error || !worker) return <div className="mx-auto max-w-4xl px-6 py-12 text-center text-red-600">{error || 'Meseriașul nu a fost găsit'}</div>;

  // Defensive coding - asiguram ca toate proprietatile exista
  const reviews = worker.reviews || [];
  const categories = worker.categories || [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link to="/search" className="text-brass-600 hover:underline mb-6 inline-block">← Înapoi la căutare</Link>
      
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-start gap-6">
          <img
            src={worker.photo_url || 'https://i.pravatar.cc/150'}
            alt={worker.full_name}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-ink-800">{worker.full_name}</h1>
            {worker.verified && <span className="text-green-600 text-sm font-semibold">✓ Verificat</span>}
            <p className="text-ink-600 mt-2">{worker.headline || 'Meseriaș profesionist'}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-ink-500">
              <span>📍 {worker.city}</span>
              <span>📞 {worker.phone}</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink-800 mb-2">Despre</h2>
          <p className="text-ink-600">{worker.bio || 'Informații indisponibile'}</p>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink-800 mb-2">Rating</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-ink-800">{worker.avg_rating || 0}</span>
            <div className="text-brass-500">
              {'★'.repeat(Math.max(0, Math.round(Number(worker.avg_rating) || 0)))}
            </div>
            <span className="text-ink-500 text-sm">({worker.review_count || 0} recenzii)</span>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-ink-800 mb-2">Specializări</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat.id} className="px-3 py-1 bg-brass-100 text-brass-700 rounded-full text-sm">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Recenzii</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-ink-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{review.client_name}</span>
                    <span className="text-brass-500">{'★'.repeat(Math.max(0, Math.round(Number(review.rating) || 0)))}</span>
                  </div>
                  <p className="text-ink-600">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
