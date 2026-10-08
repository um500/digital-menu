import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID is missing. Add it to .env.local (see .env.example)."
  );
}

/**
 * Read-only client, safe to use from Server Components and API routes.
 * It uses the CDN, so menu reads are fast and cheap. Never import this in a
 * write path — use server-client.ts (with the write token) for mutations.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
