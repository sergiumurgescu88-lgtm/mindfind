const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Configurare Multer (salvare pe disk)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Doar imaginile (jpg, png, webp) sunt permise!'));
  }
});

// POST /upload/portfolio - Upload poza portofoliu
router.post('/portfolio', authenticate, authorize('worker'), upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nicio imagine încărcată' });
    
    const imageUrl = `/uploads/${req.file.filename}`;
    const { caption } = req.body;
    
    const { rows } = await pool.query(
      `INSERT INTO worker_photos (worker_id, image_url, caption) 
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, imageUrl, caption || null]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /upload/portfolio/:workerId - Lista poze portofoliu (public sau privat)
router.get('/portfolio/:workerId', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM worker_photos WHERE worker_id = $1 ORDER BY created_at DESC`,
      [req.params.workerId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /upload/portfolio/:id - Sterge poza
router.delete('/portfolio/:id', authenticate, authorize('worker'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT image_url FROM worker_photos WHERE id = $1 AND worker_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (!rows[0]) return res.status(404).json({ error: 'Poza nu a fost găsită' });
    
    // Stergem fisierul fizic de pe server
    const filePath = path.join(__dirname, '..', rows[0].image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    // Stergem din baza de date
    await pool.query(`DELETE FROM worker_photos WHERE id = $1`, [req.params.id]);
    
    res.json({ message: 'Poza ștearsă' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
