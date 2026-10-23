const db = require('../store/db');
const { calculateTotals } = require('./pricing');

function createOrder({ customerId, items, couponCode }) {
  const lines = items.map((i) => {
    const product = db.products.get(i.productId);
    if (!product) {
      const err = new Error(`Unknown product ${i.productId}`);
      err.status = 400;
      throw err;
    }
    if (product.stock < i.quantity) {
      const err = new Error(`Insufficient stock for ${i.productId}`);
      err.status = 409;
      throw err;
    }
    return { productId: product.id, name: product.name, price: product.price, quantity: i.quantity };
  });

  for (const line of lines) {
    db.products.get(line.productId).stock -= line.quantity;
  }

  const order = {
    id: db.newOrderId(),
    customerId,
    items: lines,
    couponCode: couponCode || null,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    ...calculateTotals(lines, couponCode),
  };
  db.orders.set(order.id, order);
  return order;
}

function getOrder(id) {
  return db.orders.get(id) || null;
}

function listOrders() {
  return Array.from(db.orders.values());
}

function cancelOrder(id) {
  const order = db.orders.get(id);
  if (!order) return null;
  order.status = 'CANCELLED';
  return order;
}

module.exports = { createOrder, getOrder, listOrders, cancelOrder };
