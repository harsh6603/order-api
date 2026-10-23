const express = require('express');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const { apiKeyAuth } = require('./middleware/auth');
const { requestId } = require('./middleware/requestId');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(requestId());
  app.use(express.json({ limit: '100kb' }));
  app.use(apiKeyAuth());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/products', productsRouter);
  app.use('/orders', ordersRouter);

  app.use(notFound());
  app.use(errorHandler());

  return app;
}

module.exports = { createApp };
