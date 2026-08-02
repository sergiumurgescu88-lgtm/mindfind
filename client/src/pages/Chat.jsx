import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chat/conversations').then((res) => setConversations(res.data));

    const socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
      path: '/socket.io',
      auth: { token: localStorage.getItem('smf_token') },
    });
    socketRef.current = socket;
    socket.on('message', (msg) => {
      setMessages((prev) => (msg.conversation_id === active?.id ? [...prev, msg] : prev));
    });
    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function openConversation(c) {
    setActive(c);
    const res = await api.get(`/chat/conversations/${c.id}/messages`);
    setMessages(res.data);
    socketRef.current?.emit('join', c.id);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    socketRef.current?.emit('message', { conversationId: active.id, content: draft });
    setDraft('');
  }

  return (
    <div className="mx-auto flex h-[75vh] max-w-5xl gap-4 px-6 py-8">
      <aside className="w-64 flex-none overflow-y-auto rounded-2xl border border-ink-700/10 bg-white">
        <p className="label-tag border-b border-ink-700/10 p-3">conversații</p>
        {conversations.length === 0 && <p className="p-3 text-sm text-ink-500">Nicio conversație încă.</p>}
        {conversations.map((c) => {
          const other = user.id === c.client_id ? c.worker_name : c.client_name;
          return (
            <button
              key={c.id}
              onClick={() => openConversation(c)}
              className={`block w-full border-b border-ink-700/5 p-3 text-left text-sm hover:bg-ink-50 ${
                active?.id === c.id ? 'bg-brass-100/50' : ''
              }`}
            >
              <p className="font-medium text-ink-800">{other}</p>
              <p className="truncate text-xs text-ink-500">{c.last_message || 'Fără mesaje încă'}</p>
            </button>
          );
        })}
      </aside>

      <section className="flex flex-1 flex-col rounded-2xl border border-ink-700/10 bg-white">
        {!active ? (
          <p className="m-auto text-sm text-ink-500">Alege o conversație din stânga.</p>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <span
                    className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                      m.sender_id === user.id ? 'bg-ink-800 text-paper' : 'bg-ink-50 text-ink-800'
                    }`}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-ink-700/10 p-3">
              <input
                className="input-field flex-1"
                placeholder="Scrie un mesaj…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button className="btn-primary">Trimite</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
