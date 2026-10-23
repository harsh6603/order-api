const db = require('../store/db');
const { calculateTotals, isValidCoupon } = require('./pricing');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function createOrder({ customerId, items, couponCode }) {
  if (couponCode && !isValidCoupon(couponCode)) {
    throw httpError(400, `Invalid coupon code ${couponCode}`);
  }

  // Validate every line before mutating any stock so a failure on line N
  // does not leave lines 1..N-1 partially reserved.
  const lines = items.map((i) => {
    const product = db.products.get(i.productId);
    if (!product) throw httpError(400, `Unknown product ${i.productId}`);
    if (product.stock < i.quantity) throw httpError(409, `Insufficient stock for ${i.productId}`);
    return { productId: product.id, name: product.name, price: product.price, quantity: i.quantity };
  });

  for (const line of lines) {
    db.products.get(line.productId).stock -= line.quantity;
  }

  const order = {
    id: db.newOrderId(),
    customerId: customerId.trim(),
    items: lines,
    couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
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
  if (order.status === 'CANCELLED') {
    throw httpError(409, `Order ${id} is already cancelled`);
  }

  // Return reserved stock to inventory.
  for (const line of order.items) {
    const product = db.products.get(line.productId);
    if (product) product.stock += line.quantity;
  }

  order.status = 'CANCELLED';
  order.cancelledAt = new Date().toISOString();
  return order;
}

module.exports = { createOrder, getOrder, listOrders, cancelOrder };
