import { useEffect, useState } from 'react';
import api from '../api/client';

export default function WorkerRequests() {
  const [requests, setRequests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [sent, setSent] = useState({});

  useEffect(() => {
    api.get('/requests').then((res) => setRequests(res.data));
  }, []);

  function updateDraft(id, field, value) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function sendOffer(id) {
    const draft = drafts[id] || {};
    await api.post(`/requests/${id}/offers`, { message: draft.message || '', price: draft.price || null });
    setSent((s) => ({ ...s, [id]: true }));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <p className="label-tag">cereri deschise</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Cereri din zona ta</h1>

      {requests.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">Nu există cereri deschise momentan.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-ink-800">{r.title}</p>
                <span className="label-tag">{r.category_name || 'general'}</span>
              </div>
              <p className="mt-1 text-xs text-ink-500">{r.city} · postat de {r.client_name}</p>
              <p className="mt-2 text-sm text-ink-700">{r.description}</p>

              {sent[r.id] ? (
                <p className="mt-3 text-sm font-medium text-brass-700">Ofertă trimisă ✓</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <input placeholder="Preț estimat (lei)" type="number" className="input-field w-40"
                    onChange={(e) => updateDraft(r.id, 'price', e.target.value)} />
                  <input placeholder="Mesaj scurt" className="input-field flex-1"
                    onChange={(e) => updateDraft(r.id, 'message', e.target.value)} />
                  <button onClick={() => sendOffer(r.id)} className="btn-primary text-xs">Trimite ofertă</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
