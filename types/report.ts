import type { PaymentMethod } from "@/lib/db/models/Order";

export interface ReportSummaryView {
  from: string;
  to: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  paymentBreakdown: { method: PaymentMethod; count: number; revenue: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  hourlyRevenue: { hour: number; revenue: number; orders: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  revenueByTable: { tableLabel: string; revenue: number; orders: number }[];
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
