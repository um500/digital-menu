import { type SchemaTypeDefinition } from "sanity";

import category from "./category";
import menuItem from "./menuItem";

// Phase 2+ will add: menuOption, menuOptionValue, offer, addon.
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [category, menuItem],
};
