import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { structure } from "./structure";
import { schema } from "./schemaTypes";

// Hardcoded rather than read from .env — same non-secret values as the
// main app's NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET.
const projectId = "bfoijyut";
const dataset = "production";

export default defineConfig({
  name: "garden-cafe-studio",
  title: "Garden Cafe",
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool()],
});
