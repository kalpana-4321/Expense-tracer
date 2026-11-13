"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MdArrowBack, MdLockOutline } from "react-icons/md";
import { formatNpr } from "@/lib/format";
import type { Transaction } from "@/lib/types";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pidx = searchParams.get("pidx") ?? "";
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(Boolean(pidx));
  const [khaltiId, setKhaltiId] = useState("9800000000");
  const [mpin, setMpin] = useState("1111");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pidx) return;
    let active = true;

    fetch(`/api/khalti/sandbox?pidx=${encodeURIComponent(pidx)}`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          transaction?: Transaction;
          error?: string;
        };
        if (!res.ok || !json.transaction) {
          throw new Error(json.error || "Session not found.");
        }
        if (active) {
          setTx(json.transaction);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Khalti session."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pidx]);

  const missingPidxError = !pidx ? "Missing Khalti payment session (pidx)." : "";
  const visibleError = error || missingPidxError;

  async function submitAction(action: "complete" | "cancel") {
    if (!pidx) return;
    setError("");
    setProcessing(true);

    try {
      const res = await fetch("/api/khalti/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pidx,
          action,
          khaltiId: khaltiId.trim(),
          mpin: mpin.trim(),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Payment action failed.");
      }

      router.push(
        `/about?khalti=callback&pidx=${encodeURIComponent(pidx)}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not complete checkout."
      );
      setProcessing(false);
    }
  }

  function handlePay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitAction("complete");
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-[#0f172a]">
      <div className="mx-auto max-w-md">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#475569] hover:text-[#0f172a]"
        >
          <MdArrowBack size={18} />
          Back to Wallet
        </Link>

        <div className="mt-5 rounded-2xl border border-[#dfe7f0] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#edf2f7] pb-4">
            <div>
              <h1 className="text-lg font-bold text-[#0f172a]">
                Khalti Sandbox Checkout
              </h1>
              <p className="text-xs text-[#64748b]">
                Simulated KPG-2 gateway (set KHALTI_SECRET_KEY for live sandbox)
              </p>
            </div>
            <span className="rounded-lg bg-[#5c2d91] px-2.5 py-1 text-xs font-bold text-white">
              Khalti
            </span>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              <div className="h-6 w-40 rounded bg-[#e5ecf4]" />
              <div className="h-10 w-56 rounded bg-[#e5ecf4]" />
              <div className="h-24 w-full rounded-xl bg-[#e5ecf4]" />
            </div>
          ) : visibleError && !tx ? (
            <div className="mt-6 rounded-xl border border-[#fecaca] bg-[#fee2e2] p-4 text-sm text-[#7f1d1d]">
              {visibleError}
            </div>
          ) : tx ? (
            <>
              <div className="mt-5 rounded-xl bg-[#f8fafc] p-4">
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span>
                    {tx.direction === "request"
                      ? "Payment Request"
                      : "Wallet Transfer"}
                  </span>
                  <span className="font-mono">{tx.khaltiPidx}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#0f172a]">
                  {tx.title}
                </p>
                <p className="num mt-2 text-2xl font-bold text-[#0f172a]">
                  {formatNpr(tx.amountPaisa).formatted}
                </p>
                {tx.note && (
                  <p className="mt-1 text-xs text-[#475569]">{tx.note}</p>
                )}
              </div>

              <form onSubmit={handlePay} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="sandbox-khalti-id"
                    className="block text-sm font-medium"
                  >
                    Sandbox Khalti ID
                  </label>
                  <input
                    id="sandbox-khalti-id"
                    type="tel"
                    value={khaltiId}
                    onChange={(e) => setKhaltiId(e.target.value)}
                    placeholder="9800000000"
                    required
                    className="num mt-1.5 h-10 w-full rounded-xl border border-[#cbd5e1] px-3.5 text-sm outline-none focus:border-[#5c2d91]"
                  />
                  <p className="mt-1 text-xs text-[#64748b]">
                    Official test IDs: 9800000000 to 9800000005
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="sandbox-mpin"
                    className="block text-sm font-medium"
                  >
                    Sandbox MPIN
                  </label>
                  <input
                    id="sandbox-mpin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={mpin}
                    onChange={(e) => setMpin(e.target.value)}
                    placeholder="1111"
                    required
                    className="num mt-1.5 h-10 w-full rounded-xl border border-[#cbd5e1] px-3.5 text-sm outline-none focus:border-[#5c2d91]"
                  />
                  <p className="mt-1 text-xs text-[#64748b]">Test MPIN: 1111</p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-[#fecaca] bg-[#fee2e2] px-3 py-2 text-xs text-[#7f1d1d]"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5c2d91] text-sm font-semibold text-white transition hover:bg-[#4c247a] disabled:opacity-60"
                  >
                    <MdLockOutline size={16} />
                    {processing
                      ? "Authorizing..."
                      : `Pay ${formatNpr(tx.amountPaisa).formatted}`}
                  </button>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => void submitAction("cancel")}
                    className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-white text-sm font-medium text-[#475569] hover:bg-[#f4f7fb]"
                  >
                    Cancel Payment
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function KhaltiSandboxCheckout() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 text-[#0f172a]">
          <div className="mx-auto max-w-md rounded-2xl border border-[#dfe7f0] bg-white p-6">
            <div className="h-6 w-40 rounded bg-[#e5ecf4]" />
            <div className="mt-4 h-24 w-full rounded-xl bg-[#e5ecf4]" />
          </div>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
