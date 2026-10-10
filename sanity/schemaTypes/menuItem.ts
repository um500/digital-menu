import { defineField, defineType } from "sanity";

export default defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({
      name: "restaurantId",
      title: "Restaurant ID",
      type: "string",
      description: "Scopes this item to one client restaurant.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price (₹)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "taxPercent",
      title: "GST %",
      type: "number",
      initialValue: 5,
    }),
    defineField({
      name: "foodType",
      title: "Food type",
      type: "string",
      options: { list: ["veg", "non-veg", "egg"] },
      initialValue: "veg",
    }),
    defineField({
      name: "allergens",
      title: "Allergens",
      description: "Tag anything this dish contains, so customers can filter it out.",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: ["nuts", "dairy", "gluten", "egg", "soy", "shellfish", "sesame"],
      },
    }),
    defineField({
      name: "isAvailable",
      title: "Available",
      description: "Toggle off to 86 an item (sold out) without deleting it.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "isBestseller",
      title: "Bestseller",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isPublished",
      title: "Published",
      description: "Only published items show up on the customer menu.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "price", media: "image" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: `₹${subtitle}`, media };
    },
  },
});
