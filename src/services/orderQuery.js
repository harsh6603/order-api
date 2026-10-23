const VALID_STATUSES = ['PENDING', 'CANCELLED'];
const SORTABLE_FIELDS = ['createdAt', 'total'];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses and validates query-string options for listing orders.
 * Returns { options } on success or { errors } on failure.
 */
function parseListQuery(query) {
  const errors = [];
  const options = {
    page: 1,
    limit: DEFAULT_LIMIT,
    status: undefined,
    customerId: undefined,
    sortBy: 'createdAt',
    order: 'desc',
  };

  if (query.page !== undefined) {
    const page = parseInt(query.page, 10);
    if (Number.isNaN(page) || page < 1) errors.push('page must be a positive integer');
    else options.page = page;
  }

  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10);
    if (Number.isNaN(limit) || limit < 1) errors.push('limit must be a positive integer');
    else options.limit = Math.min(limit, MAX_LIMIT);
  }

  if (query.status !== undefined) {
    const status = String(query.status).toUpperCase();
    if (!VALID_STATUSES.includes(status)) errors.push(`status must be one of ${VALID_STATUSES.join(', ')}`);
    else options.status = status;
  }

  if (query.customerId !== undefined) options.customerId = String(query.customerId);

  if (query.sortBy !== undefined) {
    if (!SORTABLE_FIELDS.includes(query.sortBy)) errors.push(`sortBy must be one of ${SORTABLE_FIELDS.join(', ')}`);
    else options.sortBy = query.sortBy;
  }

  if (query.order !== undefined) {
    const order = String(query.order).toLowerCase();
    if (order !== 'asc' && order !== 'desc') errors.push('order must be asc or desc');
    else options.order = order;
  }

  return errors.length ? { errors } : { options };
}

function queryOrders(allOrders, { page, limit, status, customerId, sortBy, order }) {
  let results = allOrders;
  if (status) results = results.filter((o) => o.status === status);
  if (customerId) results = results.filter((o) => o.customerId === customerId);

  const direction = order === 'asc' ? 1 : -1;
  results = [...results].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1 * direction;
    if (a[sortBy] > b[sortBy]) return 1 * direction;
    return a.id.localeCompare(b.id) * direction; // stable tie-breaker
  });

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    data: results.slice(start, start + limit),
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages },
  };
}

module.exports = { parseListQuery, queryOrders, VALID_STATUSES, SORTABLE_FIELDS, DEFAULT_LIMIT, MAX_LIMIT };
