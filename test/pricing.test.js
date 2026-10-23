const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculateTotals } = require('../src/services/pricing');

test('totals are rounded to cents with no floating-point drift', () => {
  const t = calculateTotals([{ price: 0.1, quantity: 1 }, { price: 0.2, quantity: 1 }]);
  assert.equal(t.subtotal, 0.3);
  assert.equal(t.tax, 0.05);
  assert.equal(t.total, 0.35);
});

test('percent coupon', () => {
  const t = calculateTotals([{ price: 79.99, quantity: 3 }], 'SAVE10');
  assert.equal(t.subtotal, 239.97);
  assert.equal(t.discount, 24);
  assert.equal(t.tax, 38.87);
  assert.equal(t.total, 254.84);
});

test('flat coupon cannot exceed subtotal', () => {
  const t = calculateTotals([{ price: 9.99, quantity: 1 }], 'FLAT20');
  assert.equal(t.discount, 9.99);
  assert.equal(t.total, 0);
});

test('coupon codes are case-insensitive', () => {
  const t = calculateTotals([{ price: 100, quantity: 1 }], ' save10 ');
  assert.equal(t.discount, 10);
});
