import { NextResponse } from "next/server";

import { DEMO_RESTAURANT_ID } from "@/config/restaurant";
import { getMenu } from "@/lib/menu/get-menu";

export async function GET() {
  const categories = await getMenu(DEMO_RESTAURANT_ID);
  return NextResponse.json({ categories });
}
