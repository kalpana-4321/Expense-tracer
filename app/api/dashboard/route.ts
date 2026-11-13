import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const direction = searchParams.get("direction") ?? undefined;

    const data = await getDashboardData({ q, direction });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { error: "Unable to load wallet dashboard data." },
      { status: 500 }
    );
  }
}
