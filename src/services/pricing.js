const TAX_RATE = 0.18;

const COUPONS = {
  SAVE10: { type: 'percent', value: 10 },
  FLAT20: { type: 'flat', value: 20 },
};

// All money math is done in integer cents to avoid floating-point drift
// (e.g. 0.1 + 0.2 !== 0.3), then converted back to a 2-decimal number.
const toCents = (amount) => Math.round(amount * 100);
const fromCents = (cents) => cents / 100;

function calculateTotals(items, couponCode) {
  const subtotalCents = items.reduce(
    (sum, item) => sum + toCents(item.price) * item.quantity,
    0,
  );

  let discountCents = 0;
  const coupon = couponCode ? COUPONS[couponCode.trim().toUpperCase()] : undefined;
  if (coupon) {
    discountCents =
      coupon.type === 'percent'
        ? Math.round((subtotalCents * coupon.value) / 100)
        : toCents(coupon.value);
  }
  // A flat coupon must never push the order below zero.
  discountCents = Math.min(discountCents, subtotalCents);

  const taxableCents = subtotalCents - discountCents;
  const taxCents = Math.round(taxableCents * TAX_RATE);
  const totalCents = taxableCents + taxCents;

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    tax: fromCents(taxCents),
    total: fromCents(totalCents),
  };
}

function isValidCoupon(couponCode) {
  return typeof couponCode === 'string' && couponCode.trim().toUpperCase() in COUPONS;
}

module.exports = { calculateTotals, isValidCoupon, TAX_RATE, COUPONS };
