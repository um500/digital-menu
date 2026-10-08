import { type SchemaTypeDefinition } from "sanity";

import category from "./category";
import menuItem from "./menuItem";

// Kept in sync by hand with /sanity/schemaTypes in the main app — see
// README.md in this folder for why there are two copies.
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [category, menuItem],
};
