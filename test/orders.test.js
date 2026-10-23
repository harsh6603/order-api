const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const db = require('../src/store/db');

const app = createApp();
beforeEach(() => db.reset());

test('health check', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
});

test('creates an order and decrements stock', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ customerId: 'C-1', items: [{ productId: 'P-100', quantity: 2 }] });
  assert.equal(res.status, 201);
  assert.equal(res.body.items.length, 1);
  assert.equal(db.products.get('P-100').stock, 23);
});

test('rejects unknown product', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ customerId: 'C-1', items: [{ productId: 'NOPE', quantity: 1 }] });
  assert.equal(res.status, 400);
});

test('cancels an order', async () => {
  const created = await request(app)
    .post('/orders')
    .send({ customerId: 'C-1', items: [{ productId: 'P-200', quantity: 1 }] });
  const res = await request(app).post(`/orders/${created.body.id}/cancel`);
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'CANCELLED');
});

test('rejects zero, negative and fractional quantities', async () => {
  for (const quantity of [0, -5, 1.5, '2']) {
    const res = await request(app)
      .post('/orders')
      .send({ customerId: 'C-1', items: [{ productId: 'P-100', quantity }] });
    assert.equal(res.status, 400, `quantity=${quantity}`);
  }
  assert.equal(db.products.get('P-100').stock, 25);
});

test('rejects invalid coupon', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ customerId: 'C-1', items: [{ productId: 'P-100', quantity: 1 }], couponCode: 'BOGUS' });
  assert.equal(res.status, 400);
});

test('failed order does not partially reserve stock', async () => {
  const res = await request(app)
    .post('/orders')
    .send({ customerId: 'C-1', items: [{ productId: 'P-100', quantity: 1 }, { productId: 'P-300', quantity: 99 }] });
  assert.equal(res.status, 409);
  assert.equal(db.products.get('P-100').stock, 25);
});

test('cancel restores stock and cannot be repeated', async () => {
  const created = await request(app)
    .post('/orders')
    .send({ customerId: 'C-1', items: [{ productId: 'P-300', quantity: 3 }] });
  assert.equal(db.products.get('P-300').stock, 5);
  await request(app).post(`/orders/${created.body.id}/cancel`).expect(200);
  assert.equal(db.products.get('P-300').stock, 8);
  await request(app).post(`/orders/${created.body.id}/cancel`).expect(409);
  assert.equal(db.products.get('P-300').stock, 8);
});
