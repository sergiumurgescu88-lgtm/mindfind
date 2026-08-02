const jwt = require('jsonwebtoken');
const { pool } = require('../db');

function attachChatSockets(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('unauthorized'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', async (conversationId) => {
      const convo = await pool.query(`SELECT * FROM conversations WHERE id = $1`, [conversationId]);
      const c = convo.rows[0];
      if (!c) return;
      if (![c.client_id, c.worker_id].includes(socket.user.id)) return;
      socket.join(conversationId);
    });

    socket.on('message', async ({ conversationId, content }) => {
      if (!content || !content.trim()) return;
      const convo = await pool.query(`SELECT * FROM conversations WHERE id = $1`, [conversationId]);
      const c = convo.rows[0];
      if (!c || ![c.client_id, c.worker_id].includes(socket.user.id)) return;

      const { rows } = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3) RETURNING *`,
        [conversationId, socket.user.id, content.trim()]
      );
      io.to(conversationId).emit('message', rows[0]);
    });
  });
}

module.exports = { attachChatSockets };
