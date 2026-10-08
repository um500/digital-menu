import type { StructureResolver } from "sanity/structure";

// Customizes the Studio's left-hand nav. Kept flat and simple for Phase 1 —
// it grows once offers/add-ons/options schemas land.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Garden Cafe Content")
    .items([
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("menuItem").title("Menu Items"),
    ]);
