const express = require('express');
const orderService = require('../services/orderService');
const { validateCreateOrder } = require('../services/validation');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(orderService.listOrders());
});

router.get('/:id', (req, res) => {
  const order = orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', (req, res) => {
  const errors = validateCreateOrder(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  try {
    const order = orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/cancel', (req, res) => {
  try {
    const order = orderService.cancelOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
