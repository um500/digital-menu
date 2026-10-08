// Shared between the order-create route (which sets this cookie) and the
// order-detail route/page (which reads it) — see the IDOR note in get-order.ts.
export function orderSessionCookieName(orderId: string): string {
  return `order_session_${orderId}`;
}
