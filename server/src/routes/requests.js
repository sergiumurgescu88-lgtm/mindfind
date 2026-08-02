const express = require('express');
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Client creates a service request
router.post('/', authenticate, authorize('client'), async (req, res, next) => {
  try {
    const { category_id, title, description, city } = req.body;
    if (!title || !description || !city) {
      return res.status(400).json({ error: 'Completează titlu, descriere și oraș.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO requests (client_id, category_id, title, description, city)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, category_id || null, title, description, city]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Browse open requests (workers)
router.get('/', authenticate, authorize('worker'), async (req, res, next) => {
  try {
    const { city, category } = req.query;
    const params = [];
    const conditions = [`r.status = 'open'`];
    let join = '';
    if (category) {
      params.push(category);
      join = `JOIN categories c ON c.id = r.category_id AND c.slug = $${params.length}`;
    }
    if (city) {
      params.push(`%${city}%`);
      conditions.push(`r.city ILIKE $${params.length}`);
    }
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS client_name, c.name AS category_name
       FROM requests r
       JOIN users u ON u.id = r.client_id
       LEFT JOIN categories c ON c.id = r.category_id
       ${join}
       WHERE ${conditions.join(' AND ')}
       ORDER BY r.created_at DESC LIMIT 50`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Client's own requests
router.get('/mine', authenticate, authorize('client'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, c.name AS category_name,
              (SELECT COUNT(*) FROM offers o WHERE o.request_id = r.id) AS offer_count
       FROM requests r LEFT JOIN categories c ON c.id = r.category_id
       WHERE r.client_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Offers received for one of my requests (client)
router.get('/:id/offers', authenticate, async (req, res, next) => {
  try {
    const request = await pool.query(`SELECT * FROM requests WHERE id = $1`, [req.params.id]);
    if (!request.rows[0]) return res.status(404).json({ error: 'Cerere inexistentă.' });
    if (request.rows[0].client_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nu ai acces la aceste oferte.' });
    }
    const { rows } = await pool.query(
      `SELECT o.*, u.full_name AS worker_name, wp.avg_rating, wp.review_count
       FROM offers o JOIN users u ON u.id = o.worker_id
       JOIN worker_profiles wp ON wp.user_id = o.worker_id
       WHERE o.request_id = $1 ORDER BY o.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Worker submits an offer
router.post('/:id/offers', authenticate, authorize('worker'), async (req, res, next) => {
  try {
    const { message, price } = req.body;
    const request = await pool.query(`SELECT * FROM requests WHERE id = $1`, [req.params.id]);
    if (!request.rows[0]) return res.status(404).json({ error: 'Cerere inexistentă.' });
    if (request.rows[0].status !== 'open') {
      return res.status(400).json({ error: 'Cererea nu mai este deschisă.' });
    }
    const { rows } = await pool.query(
      `INSERT INTO offers (request_id, worker_id, message, price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.user.id, message || null, price || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Client accepts an offer -> assigns request, opens conversation
router.post('/offers/:offerId/accept', authenticate, authorize('client'), async (req, res, next) => {
  try {
    const offerRes = await pool.query(`SELECT * FROM offers WHERE id = $1`, [req.params.offerId]);
    const offer = offerRes.rows[0];
    if (!offer) return res.status(404).json({ error: 'Ofertă inexistentă.' });

    const reqRes = await pool.query(`SELECT * FROM requests WHERE id = $1`, [offer.request_id]);
    const request = reqRes.rows[0];
    if (!request || request.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Nu ai acces la această cerere.' });
    }

    await pool.query(`UPDATE offers SET status = 'accepted' WHERE id = $1`, [offer.id]);
    await pool.query(
      `UPDATE offers SET status = 'declined' WHERE request_id = $1 AND id <> $2 AND status = 'pending'`,
      [request.id, offer.id]
    );
    await pool.query(
      `UPDATE requests SET status = 'assigned', assigned_worker_id = $1 WHERE id = $2`,
      [offer.worker_id, request.id]
    );
    const convo = await pool.query(
      `INSERT INTO conversations (request_id, client_id, worker_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (client_id, worker_id, request_id) DO UPDATE SET request_id = EXCLUDED.request_id
       RETURNING *`,
      [request.id, req.user.id, offer.worker_id]
    );
    res.json({ ok: true, conversation: convo.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Mark request completed (client) -> enables reviews
router.post('/:id/complete', authenticate, authorize('client'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE requests SET status = 'completed'
       WHERE id = $1 AND client_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cerere inexistentă.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
