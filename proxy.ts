import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// NOTE: Next.js 16 renamed the `middleware.ts` file/export to `proxy.ts` /
// `proxy()`. This file replaces what would have been middleware.ts.

const SESSION_COOKIE = "admin_session";

const secret = process.env.SESSION_SECRET;
const encodedSecret = secret ? new TextEncoder().encode(secret) : null;

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || !encodedSecret) return false;
  try {
    await jwtVerify(token, encodedSecret);
    return true;
  } catch {
    return false;
  }
}

// Matcher below restricts this to /admin/* pages only. Admin API routes
// (api/orders, api/kitchen/stream, etc.) protect themselves individually
// via lib/auth/guards.ts's requireAdmin() — proxy can't read the
// restaurantId needed to scope those queries, only the DB layer can.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const ok = await hasValidSession(req);
  if (!ok) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
