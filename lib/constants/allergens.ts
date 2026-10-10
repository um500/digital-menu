/** Shared between the Sanity schema (admin tagging) and the customer-facing filter. */
export const ALLERGENS = [
  { value: "nuts", label: "Nuts" },
  { value: "dairy", label: "Dairy" },
  { value: "gluten", label: "Gluten" },
  { value: "egg", label: "Egg" },
  { value: "soy", label: "Soy" },
  { value: "shellfish", label: "Shellfish" },
  { value: "sesame", label: "Sesame" },
] as const;

export type Allergen = (typeof ALLERGENS)[number]["value"];
