const express = require('express');
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [users, requests, reviews] = await Promise.all([
      pool.query(`SELECT role, COUNT(*) FROM users GROUP BY role`),
      pool.query(`SELECT status, COUNT(*) FROM requests GROUP BY status`),
      pool.query(`SELECT COUNT(*) FROM reviews`),
    ]);
    res.json({
      users_by_role: users.rows,
      requests_by_status: requests.rows,
      total_reviews: Number(reviews.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, city, is_banned, created_at FROM users ORDER BY created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/users/:id/ban', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET is_banned = NOT is_banned WHERE id = $1 RETURNING id, is_banned`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Utilizator inexistent.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/reviews/:id', async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM reviews WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
