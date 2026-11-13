import { NextResponse } from "next/server";
import { getTransactionByPidx, settleKhaltiTransaction } from "@/lib/db";
import { isKhaltiConfigured, lookupKhaltiPayment } from "@/lib/khalti";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pidx?: string;
    };

    const pidx = body.pidx?.trim();
    if (!pidx) {
      return NextResponse.json(
        { error: "Payment index (pidx) is required." },
        { status: 400 }
      );
    }

    const existing = await getTransactionByPidx(pidx);
    if (!existing) {
      return NextResponse.json(
        { error: "Transaction record not found for this pidx." },
        { status: 404 }
      );
    }

    if (
      isKhaltiConfigured() &&
      !pidx.startsWith("khalti_sim_") &&
      !pidx.startsWith("khalti_req_")
    ) {
      const lookup = await lookupKhaltiPayment(pidx);
      const settled = await settleKhaltiTransaction({
        pidx,
        status: lookup.status,
        khaltiTransactionId: lookup.transaction_id,
      });

      return NextResponse.json({
        mode: "live",
        lookup,
        ...settled,
      });
    }

    return NextResponse.json({
      mode: "sandbox",
      transaction: existing,
      alreadySettled: existing.status === "Completed",
    });
  } catch (error) {
    console.error("Khalti lookup error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Khalti payment verification failed.",
      },
      { status: 500 }
    );
  }
}
