require('./setup');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

const app = createApp();

test('health is public', async () => {
  await request(app).get('/health').expect(200);
});

test('missing API key -> 401', async () => {
  await request(app).get('/orders').expect(401);
});

test('wrong API key -> 403', async () => {
  await request(app).get('/orders').set('x-api-key', 'nope').expect(403);
});

test('valid API key -> 200', async () => {
  await request(app).get('/products').set('x-api-key', 'test-key').expect(200);
});

test('malformed JSON -> 400 with request id', async () => {
  const res = await request(app)
    .post('/orders')
    .set('x-api-key', 'test-key')
    .set('content-type', 'application/json')
    .send('{"customerId":');
  assert.equal(res.status, 400);
  assert.ok(res.body.requestId);
});

test('unknown route -> 404 JSON', async () => {
  const res = await request(app).get('/nope').set('x-api-key', 'test-key');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');
});

test('propagates a safe incoming x-request-id', async () => {
  const res = await request(app).get('/health').set('x-request-id', 'abc-123');
  assert.equal(res.get('x-request-id'), 'abc-123');
});

test('replaces an unsafe incoming x-request-id', async () => {
  const res = await request(app).get('/health').set('x-request-id', '<script>');
  assert.notEqual(res.get('x-request-id'), '<script>');
});

test('service errors reach the central handler with correct status', async () => {
  const res = await request(app)
    .post('/orders')
    .set('x-api-key', 'test-key')
    .send({ customerId: 'C-1', items: [{ productId: 'NOPE', quantity: 1 }] });
  assert.equal(res.status, 400);
  assert.ok(res.body.requestId);
});
