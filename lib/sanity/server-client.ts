import "server-only";

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID is missing. Add it to .env.local (see .env.example)."
  );
}

/**
 * Write-capable client. The token is server-only (see server-only import
 * above — this throws at build time if ever pulled into a client bundle).
 * Used by admin menu management (Phase 2) and the seed script.
 */
export const sanityServerClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});
