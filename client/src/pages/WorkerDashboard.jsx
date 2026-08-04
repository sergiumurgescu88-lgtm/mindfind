import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState({ headline: '', bio: '', category_ids: [] });
  const [filters, setFilters] = useState({ city: '', category: '' });
  const [offerForm, setOfferForm] = useState({ request_id: '', price: '', message: '' });
  const [message, setMessage] = useState('');
  const [myOffers, setMyOffers] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [uploading, setUploading] = useState(false);

  function loadData() {
    api.get('/categories').then((res) => setCategories(res.data));
    api.get('/cities').then((res) => setCities(res.data));
    api.get(`/workers/${user.id}`).then((res) =>
      setProfile({
        headline: res.data.headline || '',
        bio: res.data.bio || '',
        category_ids: [],
      })
    );
    loadRequests();
    loadMyOffers();
    loadPortfolio();
  }

  function loadRequests() {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.category) params.append('category', filters.category);
    api.get(`/requests?${params}`).then((res) => setRequests(res.data));
  }

  function loadMyOffers() {
    api.get('/requests/my-offers').then((res) => setMyOffers(res.data)).catch(() => {});
  }

  function loadPortfolio() {
    api.get(`/upload/portfolio/${user.id}`).then((res) => setPortfolio(res.data)).catch(() => {});
  }

  useEffect(() => {
    loadData();
  }, [user.id]);

  useEffect(() => {
    loadRequests();
  }, [filters]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      await api.put('/workers/me/profile', profile);
      setMessage('Profil actualizat.');
    } catch (err) {
      setMessage('Eroare la actualizarea profilului.');
    }
  }

  async function handleSendOffer(e) {
    e.preventDefault();
    try {
      await api.post(`/requests/${offerForm.request_id}/offers`, {
        price: offerForm.price || null,
        message: offerForm.message || null,
      });
      setMessage('Ofertă trimisă cu succes!');
      setOfferForm({ request_id: '', price: '', message: '' });
      loadRequests();
      loadMyOffers();
    } catch (err) {
      setMessage('Eroare la trimiterea ofertei.');
    }
  }

  async function handleUploadPhoto(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', `Lucrare ${new Date().toLocaleDateString('ro-RO')}`);

    try {
      await api.post('/upload/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Poză încărcată cu succes!');
      loadPortfolio();
    } catch (err) {
      setMessage('Eroare la încărcarea pozei.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeletePhoto(photoId) {
    if (!confirm('Sigur vrei să ștergi această poză?')) return;
    try {
      await api.delete(`/upload/portfolio/${photoId}`);
      setMessage('Poză ștearsă.');
      loadPortfolio();
    } catch (err) {
      setMessage('Eroare la ștergerea pozei.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <p className="label-tag">contul meu · meseriaș</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Dashboard Meseriaș</h1>
      {message && <p className="mt-3 rounded-xl bg-brass-100/70 px-3 py-2 text-sm text-brass-700">{message}</p>}

      {/* Secțiunea 1: Cereri Disponibile */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Cererile disponibile</h2>
        
        <div className="flex gap-3 mb-4">
          <select className="input-field" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
            <option value="">Toate orașele</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">Toate categoriile</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-ink-500 text-center py-8">Nu sunt cereri disponibile în acest moment.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-display text-sm font-semibold text-ink-800">{req.title}</p>
                    <p className="text-xs text-ink-500 mt-1">
                      {req.city} · {req.category_name} · {req.client_name}
                    </p>
                    <p className="text-sm text-ink-600 mt-2">{req.description}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setOfferForm({ request_id: req.id, price: '', message: '' })}
                    className="btn-primary text-xs"
                  >
                    Trimite ofertă
                  </button>
                </div>
                {offerForm.request_id === req.id && (
                  <form onSubmit={handleSendOffer} className="mt-3 space-y-2 border-t border-ink-700/10 pt-3">
                    <input
                      type="number"
                      placeholder="Preț (lei)"
                      className="input-field"
                      value={offerForm.price}
                      onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                    />
                    <textarea
                      placeholder="Mesaj către client (opțional)"
                      rows={2}
                      className="input-field"
                      value={offerForm.message}
                      onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary text-xs">Trimite</button>
                      <button
                        type="button"
                        onClick={() => setOfferForm({ request_id: '', price: '', message: '' })}
                        className="btn-ghost-dark text-xs"
                      >
                        Anulează
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Secțiunea 2: Ofertele mele */}
      {myOffers.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Ofertele mele</h2>
          <div className="space-y-3">
            {myOffers.map((offer) => (
              <div key={offer.id} className="card p-4">
                <p className="font-display text-sm font-semibold text-ink-800">{offer.request_title}</p>
                <p className="text-xs text-ink-500 mt-1">
                  {offer.price && `${offer.price} lei · `}
                  Status: <span className="label-tag">{offer.status}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secțiunea 3: Portofoliu */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Portofoliu lucrări</h2>
        <div className="card p-5">
          <div className="mb-4">
            <label className="block font-mono text-xs uppercase tracking-wide text-ink-500 mb-2">
              Încarcă o poză cu o lucrare recentă
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUploadPhoto}
              disabled={uploading}
              className="input-field"
            />
            {uploading && <p className="text-xs text-ink-500 mt-1">Se încarcă...</p>}
          </div>

          {portfolio.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.image_url}
                    alt={photo.caption}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    Șterge
                  </button>
                  {photo.caption && (
                    <p className="text-xs text-ink-600 mt-1">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-500 text-center py-8">Nu ai încărcat nicio poză. Adaugă prima ta lucrare!</p>
          )}
        </div>
      </section>

      {/* Secțiunea 4: Profilul meu */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink-800 mb-4">Profilul meu public</h2>
        <form onSubmit={handleSaveProfile} className="card p-5 space-y-4">
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Titlu scurt</label>
            <input
              placeholder="ex. Electrician autorizat, 8 ani experiență"
              className="input-field"
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-500">Despre tine</label>
            <textarea
              rows={4}
              className="input-field"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <button className="btn-primary">Salvează profilul</button>
        </form>
      </section>
    </div>
  );
}
