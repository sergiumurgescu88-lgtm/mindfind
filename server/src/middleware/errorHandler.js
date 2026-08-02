function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Există deja o înregistrare cu aceste date.' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Eroare de server.' });
}

module.exports = { errorHandler };
