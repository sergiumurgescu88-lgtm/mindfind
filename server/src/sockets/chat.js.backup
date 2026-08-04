const { pool } = require('../db');

// Map userId -> socketId pentru notificari directe
const userSockets = new Map();

// Functie globala pentru emiterea de notificari
async function emitNotification(io, userId, data) {
  try {
    // Salvam in baza de date
    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, data.type || 'info', data.title, data.message || null, data.link || null]
    );
    
    const notification = rows[0];
    
    // Trimitem prin socket daca user-ul e online
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
    
    return notification;
  } catch (err) {
    console.error('Eroare emitNotification:', err);
  }
}

function attachChatSockets(io) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    
    if (userId) {
      userSockets.set(userId, socket.id);
      console.log(`✅ User ${userId} conectat (socket: ${socket.id})`);
    }

    // Mesaje chat
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content } = data;
        const { rows } = await pool.query(
          `INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING *`,
          [conversationId, userId, content]
        );
        
        const message = rows[0];
        
        // Gasim celalalt participant din conversatie
        const convRes = await pool.query(
          'SELECT client_id, worker_id FROM conversations WHERE id = $1',
          [conversationId]
        );
        
        if (convRes.rows[0]) {
          const recipientId = convRes.rows[0].client_id === userId 
            ? convRes.rows[0].worker_id 
            : convRes.rows[0].client_id;
          
          // Trimitem mesajul catre destinatar
          const recipientSocketId = userSockets.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('new_message', message);
          }
          
          // Trimitem notificare
          await emitNotification(io, recipientId, {
            type: 'message',
            title: 'Mesaj nou',
            message: content.substring(0, 50),
            link: '/chat'
          });
        }
      } catch (err) {
        console.error('Eroare send_message:', err);
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        userSockets.delete(userId);
        console.log(`❌ User ${userId} deconectat`);
      }
    });
  });
}

// Exportam emitNotification pentru a fi folosita in alte rute
module.exports = { attachChatSockets, emitNotification, userSockets };
