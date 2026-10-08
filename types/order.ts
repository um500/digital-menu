export type OrderStatus = "placed" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
export type OrderType = "dine-in" | "takeaway";
export type OrderSource = "qr" | "counter";
export type PaymentMethod = "online" | "cash" | "card" | "manual";
export type PaymentStatus = "pending" | "approved" | "failed";

export interface OrderItemView {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  taxPercent: number;
  notes?: string;
}

/** Shape of an Order document after it crosses the API as JSON (ObjectId → string, Date → ISO string). */
export interface OrderFeedbackView {
  rating: number;
  comment?: string;
  submittedAt: string;
}

export interface OrderView {
  _id: string;
  restaurantId: string;
  orderNumber: string;
  tableId?: string | null;
  tableLabel?: string | null;
  source: OrderSource;
  orderType: OrderType;
  items: OrderItemView[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  couponCode?: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  waiterCallAt?: string | null;
  feedback?: OrderFeedbackView | null;
  lastHandledByStaff?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Set once a Razorpay payment is verified — shown on the printed bill as a payment reference. */
  razorpayPaymentId?: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}
