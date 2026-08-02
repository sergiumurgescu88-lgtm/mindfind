const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM categories ORDER BY name`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
