import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  submitOrderFeedback,
  FeedbackAlreadySubmittedError,
  FeedbackNotAllowedError,
  OrderNotFoundError,
} from "@/lib/orders/submit-feedback";
import { orderSessionCookieName } from "@/lib/orders/session-cookie";
import { submitFeedbackSchema } from "@/lib/validations/order";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const store = await cookies();
  const sessionToken = store.get(orderSessionCookieName(orderId))?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submitFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid feedback" },
      { status: 400 }
    );
  }

  try {
    const order = await submitOrderFeedback(
      orderId,
      sessionToken,
      parsed.data.rating,
      parsed.data.comment
    );
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (err instanceof FeedbackNotAllowedError || err instanceof FeedbackAlreadySubmittedError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
