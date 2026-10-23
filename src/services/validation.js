const MAX_QUANTITY_PER_LINE = 100;
const MAX_LINES = 50;

/**
 * Validates a create-order payload. Returns an array of error strings
 * (empty when valid) so the client gets every problem in one response.
 */
function validateCreateOrder(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['Request body must be a JSON object'];

  const { customerId, items, couponCode } = body;

  if (typeof customerId !== 'string' || customerId.trim() === '') {
    errors.push('customerId must be a non-empty string');
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array');
  } else {
    if (items.length > MAX_LINES) errors.push(`items cannot contain more than ${MAX_LINES} lines`);
    const seen = new Set();
    items.forEach((item, idx) => {
      if (!item || typeof item.productId !== 'string') {
        errors.push(`items[${idx}].productId must be a string`);
        return;
      }
      if (seen.has(item.productId)) errors.push(`items[${idx}].productId is duplicated`);
      seen.add(item.productId);
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
        errors.push(`items[${idx}].quantity must be an integer between 1 and ${MAX_QUANTITY_PER_LINE}`);
      }
    });
  }

  if (couponCode !== undefined && couponCode !== null && typeof couponCode !== 'string') {
    errors.push('couponCode must be a string');
  }

  return errors;
}

module.exports = { validateCreateOrder, MAX_QUANTITY_PER_LINE, MAX_LINES };
