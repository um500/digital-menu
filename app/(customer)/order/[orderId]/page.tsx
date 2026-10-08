"use client";

import { useParams } from "next/navigation";

import { EstimatedTimeBanner } from "@/components/customer/EstimatedTimeBanner";
import { FeedbackForm } from "@/components/customer/FeedbackForm";
import { OrderStatus } from "@/components/customer/OrderStatus";
import { OrderTimeline } from "@/components/customer/OrderTimeline";
import { RazorpayPayButton } from "@/components/customer/RazorpayPayButton";
import { SplitBillPanel } from "@/components/customer/SplitBillPanel";
import { WaiterCallButton } from "@/components/customer/WaiterCallButton";
import { BillPrintButton } from "@/components/shared/BillPrintButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useOrder } from "@/hooks/use-order";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { formatCurrency } from "@/lib/utils";

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading, error, mutate } = useOrder(orderId);
  const { settings } = usePublicSettings();

  if (isLoading) return <Loading label="Loading your order..." />;
  if (error || !order) {
    return <ErrorState message="We couldn't find that order on this device." />;
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-ink">Order #{order.orderNumber}</h1>
        <OrderStatus status={order.status} />
      </div>

      <div className="mb-4 rounded-xl border border-border bg-white p-4">
        <OrderTimeline status={order.status} />
      </div>

      {!["served", "cancelled"].includes(order.status) && (
        <div className="mb-4">
          <EstimatedTimeBanner status={order.status} />
        </div>
      )}

      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="font-display mb-2 text-sm font-semibold text-ink">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span className="text-ink/70">
              {item.quantity} × {item.name}
            </span>
            <span className="text-ink">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/50">Subtotal</span>
            <span className="text-ink">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/50">Tax</span>
            <span className="text-ink">{formatCurrency(order.taxTotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-accent-dark">
              <span>
                Discount{order.couponCode && ` (${order.couponCode})`}
                {order.loyaltyPointsRedeemed > 0 && ` + ${order.loyaltyPointsRedeemed} points`}
              </span>
              <span>-{formatCurrency(order.discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
          {order.loyaltyPointsEarned > 0 && (
            <p className="pt-1 text-xs text-ink/40">
              You earned {order.loyaltyPointsEarned} loyalty points on this order.
            </p>
          )}
        </div>

        <div className="mt-3 flex justify-end border-t border-border pt-3">
          <BillPrintButton
            order={order}
            restaurantName={settings?.restaurantName ?? "Garden Cafe"}
            gstNumber={settings?.gstNumber}
          />
        </div>
      </div>

      {order.paymentMethod === "online" && order.paymentStatus === "pending" && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary-light p-4">
          <p className="mb-3 text-sm text-primary">
            Complete your payment of {formatCurrency(order.total)} to confirm this order.
          </p>
          <RazorpayPayButton
            orderId={order._id}
            orderNumber={order.orderNumber}
            restaurantName={settings?.restaurantName ?? "Garden Cafe"}
            customerName={order.customerName}
            customerPhone={order.customerPhone}
            onPaid={() => mutate()}
          />
        </div>
      )}
      {order.paymentMethod === "online" && order.paymentStatus === "approved" && (
        <p className="mt-4 text-center text-sm font-medium text-accent-dark">✓ Payment received</p>
      )}
      {order.paymentMethod !== "online" &&
        order.paymentStatus === "pending" &&
        order.source === "qr" && (
          <p className="mt-4 rounded-xl bg-cream-soft p-3 text-center text-xs text-ink/50">
            Confirming your order with the counter — it&apos;ll head to the kitchen shortly.
          </p>
        )}

      {order.orderType === "dine-in" && !["served", "cancelled"].includes(order.status) && (
        <WaiterCallButton orderId={order._id} waiterCallAt={order.waiterCallAt} onCalled={() => mutate()} />
      )}

      <div className="mt-4">
        <SplitBillPanel total={order.total} items={order.items} />
      </div>

      {order.status === "served" && (
        <div className="mt-4">
          <FeedbackForm
            orderId={order._id}
            existingFeedback={order.feedback}
            restaurantName={settings?.restaurantName}
            googleReviewLink={settings?.googleReviewLink}
            onSubmitted={() => mutate()}
          />
        </div>
      )}

      {order.paymentMethod !== "online" && (
        <p className="mt-4 text-center text-xs text-ink/40">
          Pay by {order.paymentMethod === "card" ? "card" : "cash"} at your table when the bill arrives.
        </p>
      )}
    </div>
  );
}
