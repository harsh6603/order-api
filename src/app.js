const express = require('express');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/products', productsRouter);
  app.use('/orders', ordersRouter);

  return app;
}

module.exports = { createApp };
