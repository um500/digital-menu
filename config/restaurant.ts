/**
 * Phase 1 runs a single demo restaurant end-to-end. Every multi-tenant query
 * already filters by restaurantId (see project notes on data isolation), so
 * flipping this to a per-domain or per-subdomain lookup later (Phase 2+,
 * once you onboard a second client) is a localized change — not a rewrite.
 */
export const DEMO_RESTAURANT_ID = process.env.NEXT_PUBLIC_DEMO_RESTAURANT_ID || "demo-restaurant";
