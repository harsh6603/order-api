const express = require('express');
const db = require('../store/db');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(Array.from(db.products.values()));
});

router.get('/:id', (req, res) => {
  const product = db.products.get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
