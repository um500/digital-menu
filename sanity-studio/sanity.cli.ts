import { defineCliConfig } from "sanity/cli";

// Hardcoded rather than read from .env — these aren't secret (same values
// as the main app's NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET), and this avoids
// the CLI not picking up a local .env file.
const projectId = "bfoijyut";
const dataset = "production";

export default defineCliConfig({ api: { projectId, dataset } });
