const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.put('/me/profile', authenticate, async (req, res, next) => {
  try {
    const { headline, bio } = req.body;
    await pool.query(
      `INSERT INTO worker_profiles (user_id, headline, bio, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         headline = EXCLUDED.headline,
         bio = EXCLUDED.bio,
         updated_at = NOW()`,
      [req.user.id, headline || null, bio || null]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
