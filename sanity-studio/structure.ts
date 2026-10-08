import type { StructureResolver } from "sanity/structure";

// Mirrors /sanity/structure.ts in the main app.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Garden Cafe Content")
    .items([
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("menuItem").title("Menu Items"),
    ]);
