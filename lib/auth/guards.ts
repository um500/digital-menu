import "server-only";

import { getSession, type SessionPayload } from "./session";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

/**
 * Call at the top of every protected API route. Returns the session so the
 * route can scope its DB query by session.restaurantId — never trust a
 * restaurantId coming from the request body/params instead.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}
