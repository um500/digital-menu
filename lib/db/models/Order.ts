import mongoose, { Schema, type Document, type Model } from "mongoose";

export type OrderSource = "qr" | "counter";
export type OrderType = "dine-in" | "takeaway";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";

export type PaymentStatus = "pending" | "approved" | "failed";
export type PaymentMethod = "online" | "cash" | "card" | "manual";

/**
 * Every field here is a SNAPSHOT taken at order time from the Sanity menu
 * item (name, price, tax %, any applied discount). If the admin changes the
 * menu price tomorrow, this order's bill must stay exactly what it was when
 * the customer ordered. Never recompute from live Sanity data after creation.
 */
export interface IOrderItem {
  menuItemId: string; // Sanity document _id, kept only for reference/analytics
  name: string;
  price: number; // unit price at order time
  quantity: number;
  taxPercent: number;
  notes?: string;
  customizations?: { label: string; priceDelta: number }[];
}

export interface IOrderFeedback {
  rating: number; // 1-5
  comment?: string;
  submittedAt: Date;
}

export interface IOrder extends Document {
  restaurantId: string;
  orderNumber: string; // human-readable, sequential per restaurant per day
  sessionToken: string; // random token bound to the placing customer's cookie; see lib/orders/get-order.ts
  tableId?: mongoose.Types.ObjectId | null;
  tableLabel?: string | null;
  source: OrderSource;
  orderType: OrderType;
  items: IOrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  couponCode?: string | null;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  // Phase 3 — dine-in customers can ping the counter from their order page.
  // Cleared (set back to null) once an admin acknowledges it.
  waiterCallAt?: Date | null;
  // Phase 3 — collected once the order is served; embedded rather than a
  // separate collection since it's always 1:1 with the order.
  feedback?: IOrderFeedback | null;
  // Phase 5 — name of whichever staff member was clocked in on the kitchen
  // tablet when they last changed this order's status; attribution only,
  // not an auth boundary. Denormalized (name, not a Staff ref) since it's
  // just a label on the order and the staff record may later be deleted.
  lastHandledByStaff?: string | null;
  // Phase 5 — set when this order was folded into another one via
  // mergeOrders(); the order stays in the collection (status "cancelled")
  // for historical/report purposes rather than being deleted.
  mergedIntoOrderId?: mongoose.Types.ObjectId | null;
  // Phase 6 — set once a Razorpay order/payment exists for this order.
  // razorpayOrderId is created up front (before the customer pays);
  // razorpayPaymentId is only set after a verified successful payment.
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    taxPercent: { type: Number, required: true, default: 5 },
    notes: { type: String },
    customizations: [
      {
        label: { type: String, required: true },
        priceDelta: { type: Number, required: true, default: 0 },
      },
    ],
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    restaurantId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    sessionToken: { type: String, required: true, index: true },
    tableId: { type: Schema.Types.ObjectId, ref: "Table", default: null },
    tableLabel: { type: String, default: null },
    source: { type: String, enum: ["qr", "counter"], required: true },
    orderType: { type: String, enum: ["dine-in", "takeaway"], required: true },
    items: { type: [OrderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, required: true },
    discountTotal: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: null },
    loyaltyPointsEarned: { type: Number, required: true, default: 0 },
    loyaltyPointsRedeemed: { type: Number, required: true, default: 0 },
    customerName: { type: String },
    customerPhone: { type: String },
    status: {
      type: String,
      enum: ["placed", "accepted", "preparing", "ready", "served", "cancelled"],
      default: "placed",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cash", "card", "manual"],
      default: "manual",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "approved", "failed"],
      default: "pending",
    },
    notes: { type: String },
    waiterCallAt: { type: Date, default: null },
    feedback: {
      type: new Schema<IOrderFeedback>(
        {
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String, maxlength: 500 },
          submittedAt: { type: Date, required: true, default: () => new Date() },
        },
        { _id: false }
      ),
      default: null,
    },
    lastHandledByStaff: { type: String, default: null },
    mergedIntoOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    placedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

// Live-orders board and kitchen board both query "this restaurant's open orders".
OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
