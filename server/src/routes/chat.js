const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, 
              cu.full_name AS client_name, wu.full_name AS worker_name,
              (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at
       FROM conversations c
       JOIN users cu ON cu.id = c.client_id
       JOIN users wu ON wu.id = c.worker_id
       WHERE c.client_id = $1 OR c.worker_id = $1
       ORDER BY last_message_at DESC NULLS LAST`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:id/messages', authenticate, async (req, res, next) => {
  try {
    const convo = await pool.query(`SELECT * FROM conversations WHERE id = $1`, [req.params.id]);
    if (!convo.rows[0]) return res.status(404).json({ error: 'Conversație inexistentă.' });
    if (![convo.rows[0].client_id, convo.rows[0].worker_id].includes(req.user.id)) {
      return res.status(403).json({ error: 'Nu ai acces la această conversație.' });
    }
    const { rows } = await pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
