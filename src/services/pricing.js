const TAX_RATE = 0.18;

const COUPONS = {
  SAVE10: { type: 'percent', value: 10 },
  FLAT20: { type: 'flat', value: 20 },
};

function calculateTotals(items, couponCode) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  let discount = 0;
  const coupon = COUPONS[couponCode];
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = subtotal * (coupon.value / 100);
    } else {
      discount = coupon.value;
    }
  }

  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;

  return { subtotal, discount, tax, total };
}

module.exports = { calculateTotals, TAX_RATE, COUPONS };
