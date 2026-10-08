import { NextResponse } from "next/server";

import { loginAdmin } from "@/lib/auth/admin-auth";
import { createSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
  }

  const result = await loginAdmin(parsed.data.email, parsed.data.password);

  // Same generic message whether the email doesn't exist or the password is
  // wrong — never let the response tell an attacker which one it was.
  if (!result) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSessionCookie(result);

  return NextResponse.json({
    admin: { email: result.email, name: result.name, restaurantId: result.restaurantId },
  });
}
