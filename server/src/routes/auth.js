const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, full_name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, full_name, role, city, phone } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Completează email, parolă și nume.' });
    }
    if (!['client', 'worker'].includes(role)) {
      return res.status(400).json({ error: 'Rol invalid.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Parola trebuie să aibă minim 6 caractere.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, city, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, city, phone, created_at`,
      [email.toLowerCase().trim(), hash, full_name, role, city || null, phone || null]
    );
    const user = rows[0];
    if (role === 'worker') {
      await pool.query(`INSERT INTO worker_profiles (user_id) VALUES ($1)`, [user.id]);
    }
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      (email || '').toLowerCase().trim(),
    ]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Email sau parolă incorecte.' });
    if (user.is_banned) return res.status(403).json({ error: 'Cont suspendat.' });
    const valid = await bcrypt.compare(password || '', user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email sau parolă incorecte.' });
    const token = signToken(user);
    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, full_name, role, city, phone, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Utilizator inexistent.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
