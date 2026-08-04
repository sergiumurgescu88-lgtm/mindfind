const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT city FROM users WHERE city IS NOT NULL AND city != '' ORDER BY city"
    );
    res.json(result.rows.map(r => r.city));
  } catch (err) {
    console.error('Eroare /cities:', err);
    res.status(500).json({ error: 'Eroare la preluarea oraselor' });
  }
});

module.exports = router;
