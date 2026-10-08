import { config as loadEnv } from "dotenv";
import { defineCliConfig } from "sanity/cli";

// sanity.cli.ts runs in plain Node, before the Studio's own bundler starts,
// so it won't auto-load .env the way sanity.config.ts does — load it here
// explicitly, or `sanity deploy` fails with "does not contain a project
// identifier".
loadEnv();

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineCliConfig({ api: { projectId, dataset } });
