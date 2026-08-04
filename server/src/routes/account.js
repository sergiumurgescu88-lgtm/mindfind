const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { full_name, phone, city } = req.body;
    const { rows } = await pool.query(
      `UPDATE users 
       SET full_name = $1, phone = $2, city = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name, phone, city, role, created_at, is_banned`,
      [full_name, phone, city, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Change password
router.post('/me/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Completează ambele câmpuri' });
    }

    // Get current user with password hash
    const { rows } = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Utilizator negăsit' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Parola actuală este incorectă' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({ message: 'Parolă schimbată cu succes' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
