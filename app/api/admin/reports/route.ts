import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { getReportSummary, resolveReportRange } from "@/lib/reports/get-report";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const { searchParams } = new URL(req.url);

    const { from, to } = resolveReportRange(searchParams.get("from"), searchParams.get("to"));
    const report = await getReportSummary(session.restaurantId, from, to);

    return NextResponse.json({ report });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}
