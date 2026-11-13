import { NextResponse } from "next/server";
import { createPendingKhaltiTransaction, getDashboardData } from "@/lib/db";
import { initiateKhaltiPayment } from "@/lib/khalti";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      mode?: "send" | "request";
      amountNpr?: number;
      counterpartyName?: string;
      counterpartyPhone?: string;
      category?: string;
      note?: string;
    };

    const mode = body.mode === "request" ? "request" : "send";
    const amountNpr = Number(body.amountNpr ?? 0);
    const counterpartyName = body.counterpartyName?.trim() ?? "";
    const counterpartyPhone = body.counterpartyPhone?.trim() ?? "";
    const category =
      body.category?.trim() || (mode === "request" ? "Split Bill" : "Transfer");
    const note = body.note?.trim() || null;

    if (!counterpartyName) {
      return NextResponse.json(
        {
          error:
            mode === "send"
              ? "Enter a recipient name or merchant."
              : "Enter the payer's name.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountNpr) || amountNpr < 10) {
      return NextResponse.json(
        { error: "Khalti requires a minimum amount of Rs. 10." },
        { status: 400 }
      );
    }

    if (counterpartyPhone && !/^9[678]\d{8}$/.test(counterpartyPhone)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid 10-digit Nepal mobile number (e.g. 9800000000).",
        },
        { status: 400 }
      );
    }

    const amountPaisa = Math.round(amountNpr * 100);

    if (mode === "send") {
      const { wallet } = await getDashboardData();
      if (amountPaisa > wallet.balancePaisa) {
        return NextResponse.json(
          { error: "Insufficient wallet balance for this transfer." },
          { status: 400 }
        );
      }
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
      new URL(request.url).origin;

    const purchaseOrderId = `NOVA-${mode.toUpperCase()}-${Date.now()}`;
    const purchaseOrderName =
      mode === "send"
        ? `Send to ${counterpartyName}`
        : `Request from ${counterpartyName}`;

    const khaltiResult = await initiateKhaltiPayment({
      amountPaisa,
      purchaseOrderId,
      purchaseOrderName,
      returnUrl: `${origin}/about?khalti=callback`,
      websiteUrl: origin,
      customerInfo: {
        name: counterpartyName,
        phone: counterpartyPhone || "9800000000",
      },
    });

    const transaction = await createPendingKhaltiTransaction({
      title: counterpartyName,
      counterparty: counterpartyName,
      counterpartyPhone: counterpartyPhone || null,
      category,
      direction: mode === "request" ? "request" : "debit",
      status: mode === "request" ? "Requested" : "Initiated",
      amountPaisa,
      khaltiPidx: khaltiResult.pidx,
      purchaseOrderId,
      paymentUrl: khaltiResult.payment_url,
      note,
    });

    return NextResponse.json(
      {
        pidx: khaltiResult.pidx,
        paymentUrl: khaltiResult.payment_url,
        khaltiMode: khaltiResult.mode,
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Khalti initiate error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not initiate Khalti payment.",
      },
      { status: 500 }
    );
  }
}
