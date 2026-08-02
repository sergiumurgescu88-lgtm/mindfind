import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  function load() {
    api.get('/admin/stats').then((res) => setStats(res.data));
    api.get('/admin/users').then((res) => setUsers(res.data));
  }

  useEffect(load, []);

  async function toggleBan(id) {
    await api.post(`/admin/users/${id}/ban`);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="label-tag">panou admin</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink-800">Moderare platformă</h1>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.users_by_role.map((s) => (
            <div key={s.role} className="card p-4">
              <p className="label-tag">{s.role}</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink-800">{s.count}</p>
            </div>
          ))}
          <div className="card p-4">
            <p className="label-tag">recenzii</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink-800">{stats.total_reviews}</p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <p className="label-tag">utilizatori</p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-ink-700/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 font-mono text-xs uppercase text-ink-500">
              <tr>
                <th className="p-3">Nume</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Oraș</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-ink-700/10">
                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3 text-ink-500">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.city}</td>
                  <td className="p-3">{u.is_banned ? 'suspendat' : 'activ'}</td>
                  <td className="p-3">
                    <button onClick={() => toggleBan(u.id)} className="btn-ghost-dark text-xs">
                      {u.is_banned ? 'Deblochează' : 'Suspendă'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
