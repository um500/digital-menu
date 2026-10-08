import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ admin: null }, { status: 200 });
  }
  return NextResponse.json({
    admin: { email: session.email, name: session.name, restaurantId: session.restaurantId },
  });
}
