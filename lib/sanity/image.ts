import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";

import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: Image | undefined) {
  if (!source?.asset) return undefined;
  return builder.image(source).auto("format").fit("max");
}
