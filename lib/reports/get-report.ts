import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Order, type PaymentMethod } from "@/lib/db/models/Order";

export interface ReportSummary {
  from: string; // ISO
  to: string; // ISO
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  paymentBreakdown: { method: PaymentMethod; count: number; revenue: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  /** Revenue bucketed by hour-of-day (IST, 0-23) — only hours with at least one order are included. */
  hourlyRevenue: { hour: number; revenue: number; orders: number }[];
  /** Revenue bucketed by calendar day (IST, "YYYY-MM-DD") — the Reports page's trend chart. */
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  revenueByTable: { tableLabel: string; revenue: number; orders: number }[];
  /** Per-order GST breakdown for the Sales Register / CSV export — capped at 500 rows. */
  gstRegister: {
    orderNumber: string;
    date: string;
    subtotal: number;
    cgst: number;
    sgst: number;
    total: number;
    paymentMethod: PaymentMethod;
  }[];
  avgRating: number | null;
  feedbackCount: number;
  recentFeedback: { orderNumber: string; rating: number; comment?: string; submittedAt: string }[];
}

// India-only product (Phase 1), so "today" always means the IST calendar day
// regardless of which timezone the server process happens to run in.
const IST_OFFSET_MINUTES = 5 * 60 + 30;

function istDateOnly(dateStr: string): Date {
  // dateStr is "YYYY-MM-DD" as picked in IST; convert midnight-IST to UTC.
  const utcMidnight = new Date(`${dateStr}T00:00:00.000Z`);
  return new Date(utcMidnight.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
}

function todayInIst(): string {
  const now = new Date(Date.now() + IST_OFFSET_MINUTES * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

/** Resolves the query's date range, defaulting to "today" in IST when not given. */
export function resolveReportRange(fromParam: string | null, toParam: string | null) {
  const fromDay = fromParam ?? todayInIst();
  const toDay = toParam ?? fromDay;

  const from = istDateOnly(fromDay);
  // "to" is inclusive of the whole day, so push to the start of the next day.
  const to = new Date(istDateOnly(toDay).getTime() + 24 * 60 * 60 * 1000);

  return { from, to };
}

export async function getReportSummary(
  restaurantId: string,
  from: Date,
  to: Date
): Promise<ReportSummary> {
  await connectDB();

  const match = {
    restaurantId,
    status: { $ne: "cancelled" as const },
    createdAt: { $gte: from, $lt: to },
  };

  const [summary] = await Order.aggregate<{
    totalOrders: number;
    totalRevenue: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);

  const paymentBreakdownRaw = await Order.aggregate<{
    _id: PaymentMethod;
    count: number;
    revenue: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const topItemsRaw = await Order.aggregate<{
    _id: string;
    quantity: number;
    revenue: number;
  }>([
    { $match: match },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 10 },
  ]);

  const hourlyRevenueRaw = await Order.aggregate<{
    _id: number;
    revenue: number;
    orders: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailyRevenueRaw = await Order.aggregate<{
    _id: string;
    revenue: number;
    orders: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: "Asia/Kolkata" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenueByTableRaw = await Order.aggregate<{
    _id: string;
    revenue: number;
    orders: number;
  }>([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$tableLabel", "Takeaway"] },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const gstRegisterDocs = await Order.find(match)
    .select("orderNumber createdAt subtotal taxTotal total paymentMethod")
    .sort({ createdAt: 1 })
    .limit(500);

  const feedbackMatch = { ...match, feedback: { $ne: null } };

  const [feedbackSummary] = await Order.aggregate<{ avgRating: number; count: number }>([
    { $match: feedbackMatch },
    { $group: { _id: null, avgRating: { $avg: "$feedback.rating" }, count: { $sum: 1 } } },
  ]);

  const recentFeedbackDocs = await Order.find(feedbackMatch)
    .select("orderNumber feedback")
    .sort({ "feedback.submittedAt": -1 })
    .limit(5);

  const totalOrders = summary?.totalOrders ?? 0;
  const totalRevenue = summary?.totalRevenue ?? 0;

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    totalOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    paymentBreakdown: paymentBreakdownRaw.map((row) => ({
      method: row._id,
      count: row.count,
      revenue: row.revenue,
    })),
    topItems: topItemsRaw.map((row) => ({
      name: row._id,
      quantity: row.quantity,
      revenue: row.revenue,
    })),
    hourlyRevenue: hourlyRevenueRaw.map((row) => ({
      hour: row._id,
      revenue: row.revenue,
      orders: row.orders,
    })),
    dailyRevenue: dailyRevenueRaw.map((row) => ({
      date: row._id,
      revenue: row.revenue,
      orders: row.orders,
    })),
    revenueByTable: revenueByTableRaw.map((row) => ({
      tableLabel: row._id,
      revenue: row.revenue,
      orders: row.orders,
    })),
    gstRegister: gstRegisterDocs.map((o) => ({
      orderNumber: o.orderNumber,
      date: o.createdAt.toISOString(),
      subtotal: o.subtotal,
      cgst: o.taxTotal / 2,
      sgst: o.taxTotal / 2,
      total: o.total,
      paymentMethod: o.paymentMethod,
    })),
    avgRating: feedbackSummary ? Math.round(feedbackSummary.avgRating * 10) / 10 : null,
    feedbackCount: feedbackSummary?.count ?? 0,
    recentFeedback: recentFeedbackDocs.map((o) => ({
      orderNumber: o.orderNumber,
      rating: o.feedback!.rating,
      comment: o.feedback!.comment,
      submittedAt: o.feedback!.submittedAt.toISOString(),
    })),
  };
}
