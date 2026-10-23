const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const db = require('../src/store/db');

const app = createApp();

async function seed() {
  const specs = [
    ['C-1', 'P-400', 1],
    ['C-2', 'P-100', 1],
    ['C-1', 'P-300', 1],
    ['C-3', 'P-200', 2],
    ['C-1', 'P-400', 5],
  ];
  const ids = [];
  for (const [customerId, productId, quantity] of specs) {
    const res = await request(app).post('/orders').send({ customerId, items: [{ productId, quantity }] });
    ids.push(res.body.id);
  }
  await request(app).post(`/orders/${ids[1]}/cancel`);
  return ids;
}

beforeEach(() => db.reset());

test('returns a paginated envelope with defaults', async () => {
  await seed();
  const res = await request(app).get('/orders');
  assert.equal(res.status, 200);
  assert.equal(res.body.data.length, 5);
  assert.deepEqual(res.body.pagination, { page: 1, limit: 20, total: 5, totalPages: 1, hasNext: false });
});

test('paginates', async () => {
  await seed();
  const res = await request(app).get('/orders?limit=2&page=2&sortBy=createdAt&order=asc');
  assert.equal(res.body.data.length, 2);
  assert.equal(res.body.pagination.hasNext, true);
  assert.equal(res.body.pagination.totalPages, 3);
});

test('filters by status and customer', async () => {
  await seed();
  const cancelled = await request(app).get('/orders?status=cancelled');
  assert.equal(cancelled.body.data.length, 1);
  const c1 = await request(app).get('/orders?customerId=C-1');
  assert.equal(c1.body.data.length, 3);
});

test('sorts by total', async () => {
  await seed();
  const res = await request(app).get('/orders?sortBy=total&order=desc');
  const totals = res.body.data.map((o) => o.total);
  assert.deepEqual(totals, [...totals].sort((a, b) => b - a));
});

test('caps limit at 100', async () => {
  const res = await request(app).get('/orders?limit=5000');
  assert.equal(res.body.pagination.limit, 100);
});

test('rejects invalid query params', async () => {
  for (const qs of ['page=0', 'limit=-1', 'status=SHIPPED', 'sortBy=customerId', 'order=up']) {
    const res = await request(app).get(`/orders?${qs}`);
    assert.equal(res.status, 400, qs);
  }
});
