import crypto from "node:crypto";

const DEFAULT_KHALTI_BASE_URL = "https://dev.khalti.com/api/v2";

export function isKhaltiConfigured(): boolean {
  return Boolean(process.env.KHALTI_SECRET_KEY?.trim());
}

export function getKhaltiBaseUrl(): string {
  return (process.env.KHALTI_BASE_URL || DEFAULT_KHALTI_BASE_URL).replace(
    /\/+$/,
    ""
  );
}

export interface KhaltiInitiateInput {
  amountPaisa: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  returnUrl: string;
  websiteUrl: string;
  customerInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface KhaltiInitiateResult {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
  mode: "live" | "sandbox";
}

export async function initiateKhaltiPayment(
  input: KhaltiInitiateInput
): Promise<KhaltiInitiateResult> {
  const secretKey = process.env.KHALTI_SECRET_KEY?.trim();

  if (!secretKey) {
    const pidx = `khalti_sim_${crypto.randomBytes(8).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    return {
      pidx,
      payment_url: `/khalti/checkout?pidx=${encodeURIComponent(pidx)}`,
      expires_at: expiresAt,
      expires_in: 1800,
      mode: "sandbox",
    };
  }

  const endpoint = `${getKhaltiBaseUrl()}/epayment/initiate/`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: input.returnUrl,
      website_url: input.websiteUrl,
      amount: input.amountPaisa,
      purchase_order_id: input.purchaseOrderId,
      purchase_order_name: input.purchaseOrderName,
      customer_info: {
        name: input.customerInfo.name,
        email: input.customerInfo.email || "wallet@novafinance.np",
        phone: input.customerInfo.phone || "9800000000",
      },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok || typeof data.pidx !== "string" || typeof data.payment_url !== "string") {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data) || "Khalti initiation failed";
    throw new Error(`Khalti API error (${response.status}): ${detail}`);
  }

  return {
    pidx: data.pidx,
    payment_url: data.payment_url,
    expires_at: String(data.expires_at ?? ""),
    expires_in: Number(data.expires_in ?? 1800),
    mode: "live",
  };
}

export interface KhaltiLookupResult {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "Canceled";
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
  mode: "live" | "sandbox";
}

export async function lookupKhaltiPayment(
  pidx: string
): Promise<KhaltiLookupResult> {
  const secretKey = process.env.KHALTI_SECRET_KEY?.trim();

  if (!secretKey || pidx.startsWith("khalti_sim_") || pidx.startsWith("khalti_req_")) {
    return {
      pidx,
      total_amount: 0,
      status: "Pending",
      transaction_id: null,
      fee: 0,
      refunded: false,
      mode: "sandbox",
    };
  }

  const endpoint = `${getKhaltiBaseUrl()}/epayment/lookup/`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok || typeof data.status !== "string") {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : "Unable to verify payment with Khalti.";
    throw new Error(`Khalti lookup error (${response.status}): ${detail}`);
  }

  return {
    pidx: String(data.pidx ?? pidx),
    total_amount: Number(data.total_amount ?? 0),
    status: data.status as KhaltiLookupResult["status"],
    transaction_id: data.transaction_id ? String(data.transaction_id) : null,
    fee: Number(data.fee ?? 0),
    refunded: Boolean(data.refunded),
    mode: "live",
  };
}
