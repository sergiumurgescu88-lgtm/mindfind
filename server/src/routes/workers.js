const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// 1. Ruta de lista (fara parametri)
router.get('/', async (req, res) => {
  const { category, city } = req.query;
  try {
    let query = `
      SELECT DISTINCT u.id, u.full_name, u.city, u.phone,
             wp.headline, wp.bio, wp.photo_url, wp.avg_rating, wp.review_count, wp.verified
      FROM users u
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id
      WHERE u.role = 'worker' AND u.is_banned = false
    `;
    const params = [];
    let paramIndex = 1;
    if (category) {
      query += ` AND u.id IN (
        SELECT wc.worker_id FROM worker_categories wc
        INNER JOIN categories c ON wc.category_id = c.id
        WHERE c.slug = $${paramIndex}
      )`;
      params.push(category);
      paramIndex++;
    }
    if (city) {
      query += ` AND u.city = $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }
    query += ' ORDER BY wp.avg_rating DESC NULLS LAST, wp.review_count DESC NULLS LAST';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Eroare GET /workers:', err);
    res.status(500).json({ error: 'Eroare la preluarea meseriasilor' });
  }
});

// 2. RUTA STATICA - Trebuie sa fie INAINTE de /:id !
router.get('/cities', async (req, res) => {
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

// 3. Ruta dinamica (cu parametru) - la final
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.city, u.phone,
             wp.headline, wp.bio, wp.photo_url, wp.avg_rating, wp.review_count, wp.verified
      FROM users u
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id
      WHERE u.id = $1 AND u.role = 'worker'
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meseriasul nu a fost gasit' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Eroare GET /workers/:id:', err);
    res.status(500).json({ error: 'Eroare la preluarea detaliilor' });
  }
});

module.exports = router;
