const express = require('express');
const orderService = require('../services/orderService');
const { parseListQuery, queryOrders } = require('../services/orderQuery');

const router = express.Router();

// GET /orders?status=PENDING&customerId=C-1&sortBy=total&order=asc&page=2&limit=10
router.get('/', (req, res) => {
  const { errors, options } = parseListQuery(req.query);
  if (errors) return res.status(400).json({ error: 'Invalid query', details: errors });
  res.json(queryOrders(orderService.listOrders(), options));
});

router.get('/:id', (req, res) => {
  const order = orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.post('/', (req, res) => {
  const { customerId, items, couponCode } = req.body;
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerId and at least one item are required' });
  }
  try {
    const order = orderService.createOrder({ customerId, items, couponCode });
    res.status(201).json(order);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/cancel', (req, res) => {
  const order = orderService.cancelOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

module.exports = router;
