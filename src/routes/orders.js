const express = require('express');
const orderService = require('../services/orderService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(orderService.listOrders());
});

router.get('/:id', (req, res) => {
  const order = orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found', requestId: req.id });
  res.json(order);
});

// Errors thrown by the service propagate to the central error handler.
router.post('/', (req, res) => {
  const { customerId, items, couponCode } = req.body;
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerId and at least one item are required', requestId: req.id });
  }
  const order = orderService.createOrder({ customerId, items, couponCode });
  res.status(201).json(order);
});

router.post('/:id/cancel', (req, res) => {
  const order = orderService.cancelOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found', requestId: req.id });
  res.json(order);
});

module.exports = router;
