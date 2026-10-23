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
