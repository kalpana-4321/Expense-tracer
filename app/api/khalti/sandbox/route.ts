import { NextResponse } from "next/server";
import { getTransactionByPidx, settleKhaltiTransaction } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pidx = searchParams.get("pidx")?.trim();
    if (!pidx) {
      return NextResponse.json({ error: "Missing pidx." }, { status: 400 });
    }
    const tx = await getTransactionByPidx(pidx);
    if (!tx) {
      return NextResponse.json(
        { error: "Khalti session not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ transaction: tx });
  } catch (error) {
    console.error("Khalti sandbox GET error:", error);
    return NextResponse.json(
      { error: "Unable to load Khalti checkout session." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pidx?: string;
      action?: "complete" | "cancel";
      khaltiId?: string;
      mpin?: string;
    };

    const pidx = body.pidx?.trim();
    if (!pidx) {
      return NextResponse.json({ error: "Missing pidx." }, { status: 400 });
    }

    const action = body.action === "cancel" ? "cancel" : "complete";

    if (action === "complete") {
      const khaltiId = body.khaltiId?.trim() ?? "";
      const mpin = body.mpin?.trim() ?? "";
      if (!/^9[678]\d{8}$/.test(khaltiId)) {
        return NextResponse.json(
          { error: "Enter a valid Khalti ID (e.g. 9800000000)." },
          { status: 400 }
        );
      }
      if (!/^\d{4}$/.test(mpin)) {
        return NextResponse.json(
          { error: "Enter your 4-digit sandbox MPIN (e.g. 1111)." },
          { status: 400 }
        );
      }
    }

    const status = action === "complete" ? "Completed" : "Canceled";
    const txnId =
      action === "complete"
        ? `KLT-SIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        : null;

    const settled = await settleKhaltiTransaction({
      pidx,
      status,
      khaltiTransactionId: txnId,
    });

    if (!settled.transaction) {
      return NextResponse.json(
        { error: "Khalti transaction not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(settled);
  } catch (error) {
    console.error("Khalti sandbox POST error:", error);
    return NextResponse.json(
      { error: "Sandbox payment processing failed." },
      { status: 500 }
    );
  }
}
