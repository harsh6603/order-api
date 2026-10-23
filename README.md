# order-api

A small order-management REST API built with Node.js and Express, backed by an in-memory store.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/products` | List products |
| GET | `/products/:id` | Get a product |
| GET | `/orders` | List orders |
| GET | `/orders/:id` | Get an order |
| POST | `/orders` | Create an order `{ customerId, items: [{ productId, quantity }], couponCode? }` |
| POST | `/orders/:id/cancel` | Cancel an order |

## Run

```bash
npm install
npm start      # http://localhost:3000
npm test
```

## Authentication

All endpoints except `/health` require an `x-api-key` header. Configure valid keys with a comma-separated env var:

```bash
API_KEYS=key-one,key-two npm start
curl -H "x-api-key: key-one" http://localhost:3000/orders
```

Every response carries an `x-request-id` header (an incoming one is reused if it is safe), and error bodies include `requestId` for log correlation.
