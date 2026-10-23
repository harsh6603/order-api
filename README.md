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

## Listing orders

`GET /orders` supports filtering, sorting and pagination:

| Param | Values | Default |
|---|---|---|
| `status` | `PENDING`, `CANCELLED` (case-insensitive) | all |
| `customerId` | exact match | all |
| `sortBy` | `createdAt`, `total` | `createdAt` |
| `order` | `asc`, `desc` | `desc` |
| `page` | integer ≥ 1 | `1` |
| `limit` | integer 1–100 | `20` |

Response shape:

```json
{ "data": [ ... ], "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3, "hasNext": true } }
```
