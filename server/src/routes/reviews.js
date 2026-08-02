const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create a review after a completed request. Direction is derived from roles.
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { request_id, rating, comment } = req.body;
    if (!request_id || !rating) {
      return res.status(400).json({ error: 'Completează cererea și ratingul.' });
    }
    const reqRes = await pool.query(`SELECT * FROM requests WHERE id = $1`, [request_id]);
    const request = reqRes.rows[0];
    if (!request || request.status !== 'completed') {
      return res.status(400).json({ error: 'Poți lăsa recenzie doar pentru cereri finalizate.' });
    }

    let revieweeId, direction;
    if (req.user.id === request.client_id) {
      revieweeId = request.assigned_worker_id;
      direction = 'client_to_worker';
    } else if (req.user.id === request.assigned_worker_id) {
      revieweeId = request.client_id;
      direction = 'worker_to_client';
    } else {
      return res.status(403).json({ error: 'Nu ai participat la această cerere.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO reviews (request_id, reviewer_id, reviewee_id, direction, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [request_id, req.user.id, revieweeId, direction, rating, comment || null]
    );

    if (direction === 'client_to_worker') {
      await pool.query(
        `UPDATE worker_profiles SET
           review_count = review_count + 1,
           avg_rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = $1 AND direction = 'client_to_worker')
         WHERE user_id = $1`,
        [revieweeId]
      );
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.full_name AS reviewer_name
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewee_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
