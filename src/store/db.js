// Simple in-memory store. Swappable for a real DB later.
const products = new Map([
  ['P-100', { id: 'P-100', name: 'Mechanical Keyboard', price: 79.99, stock: 25 }],
  ['P-200', { id: 'P-200', name: 'USB-C Hub', price: 34.5, stock: 40 }],
  ['P-300', { id: 'P-300', name: '27" Monitor', price: 249.0, stock: 8 }],
  ['P-400', { id: 'P-400', name: 'Mouse Pad', price: 9.99, stock: 100 }],
]);

const orders = new Map();
let nextOrderId = 1;

function newOrderId() {
  return `O-${String(nextOrderId++).padStart(5, '0')}`;
}

function reset() {
  orders.clear();
  nextOrderId = 1;
  products.get('P-100').stock = 25;
  products.get('P-200').stock = 40;
  products.get('P-300').stock = 8;
  products.get('P-400').stock = 100;
}

module.exports = { products, orders, newOrderId, reset };
