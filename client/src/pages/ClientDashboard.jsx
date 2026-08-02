import { useEffect, useState } from 'react';
import api from '../api/client';

export default function ClientDashboard() {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', city: '', category_id: '' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');

  function loadRequests() {
    api.get('/requests/mine').then((res) => setRequests(res.data));
  }

  useEffect(() => {
    loadRequests();
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await api.post('/requests', { ...form, category_id: form.category_id || null });
    setForm({ title: '', description: '', city: '', category_id: '' });
    setMessage('Cerere publicată.');
    loadRequests();
  }

  async function openOffers(request) {
    setSelectedRequest(request);
    const res = await api.get(`/requests/${request.id}/offers`);
    setOffers(res.data);
  }

  async function acceptOffer(offerId) {
    await api.post(`/requests/offers/${offerId}/accept`);
    setMessage('Ofertă acceptată. Poți discuta acum în secțiunea Mesaje.');
    setSelectedRequest(null);
    loadRequests();
  }

  async function markComplete(id) {
    await api.post(`/requests/${id}/complete`);
    loadRequests();
  }

  async function submitReview(request) {
    await api.post('/reviews', { request_id: request.id, ...reviewDraft });
    setMessage('Mulțumim pentru recenzie!');
    setReviewDraft({ rating: 5, comment: '' });
    loadRequests();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="label-tag">contul meu · client</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Cererile mele</h1>
      {message && <p className="mt-3 rounded-xl bg-brass-100/70 px-3 py-2 text-sm text-brass-700">{message}</p>}

      <form onSubmit={handleCreate} className="card mt-6 space-y-3 p-5">
        <p className="font-display text-sm font-semibold text-ink-800">Postează o cerere nouă</p>
        <input required placeholder="Titlu (ex. Reparație robinet baie)" className="input-field"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea required placeholder="Descriere detaliată" rows={3} className="input-field"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input-field" value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Categorie</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required placeholder="Oraș" className="input-field"
            value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <button className="btn-primary">Publică cererea</button>
      </form>

      <div className="mt-10 space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-semibold text-ink-800">{r.title}</p>
                <p className="text-xs text-ink-500">{r.city} · {r.category_name || 'fără categorie'} · {r.offer_count} oferte</p>
              </div>
              <span className="label-tag">{r.status}</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {r.status === 'open' && (
                <button onClick={() => openOffers(r)} className="btn-ghost-dark text-xs">Vezi oferte</button>
              )}
              {r.status === 'assigned' && (
                <button onClick={() => markComplete(r.id)} className="btn-ghost-dark text-xs">Marchează finalizată</button>
              )}
              {r.status === 'completed' && (
                <div className="mt-2 w-full space-y-2 border-t border-ink-700/10 pt-3">
                  <p className="text-xs text-ink-500">Lasă o recenzie meseriașului:</p>
                  <div className="flex items-center gap-2">
                    <select className="input-field w-24"
                      value={reviewDraft.rating}
                      onChange={(e) => setReviewDraft({ ...reviewDraft, rating: Number(e.target.value) })}>
                      {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                    <input placeholder="Comentariu (opțional)" className="input-field flex-1"
                      value={reviewDraft.comment}
                      onChange={(e) => setReviewDraft({ ...reviewDraft, comment: e.target.value })} />
                    <button onClick={() => submitReview(r)} className="btn-primary text-xs">Trimite</button>
                  </div>
                </div>
              )}
            </div>

            {selectedRequest?.id === r.id && (
              <div className="mt-4 space-y-2 border-t border-ink-700/10 pt-4">
                {offers.length === 0 ? (
                  <p className="text-sm text-ink-500">Încă nu au venit oferte.</p>
                ) : offers.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{o.worker_name} {o.price ? `· ${o.price} lei` : ''}</p>
                      {o.message && <p className="text-xs text-ink-500">{o.message}</p>}
                    </div>
                    {o.status === 'pending' ? (
                      <button onClick={() => acceptOffer(o.id)} className="btn-primary text-xs">Acceptă</button>
                    ) : (
                      <span className="label-tag">{o.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
