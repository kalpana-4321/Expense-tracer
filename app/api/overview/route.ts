import { NextResponse } from "next/server";
import { getOverviewData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") ?? undefined;

    const data = await getOverviewData(month);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Overview GET error:", error);
    return NextResponse.json(
      { error: "Unable to load overview analytics." },
      { status: 500 }
    );
  }
}
