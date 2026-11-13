"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiFillFileText } from "react-icons/ai";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import { MdSavings, MdRefresh } from "react-icons/md";
import { BottomNav } from "@/components/BottomNav";
import { KhaltiActionSheet } from "@/components/KhaltiActionSheet";
import { DashboardSkeleton } from "@/components/Skeleton";
import { TransactionSection } from "@/components/TransactionSection";
import { LogoMark } from "@/components/Logo";
import { formatNpr } from "@/lib/format";
import type { DashboardResponse, Transaction } from "@/lib/types";

export default function About() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"send" | "request">("send");
  const [callbackBanner, setCallbackBanner] = useState<{
    tone: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = (await res.json()) as DashboardResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Unable to load wallet dashboard.");
      }
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const khaltiFlag = params.get("khalti");
    const pidx = params.get("pidx");

    async function init() {
      if (khaltiFlag === "callback" && pidx) {
        try {
          const lookupRes = await fetch("/api/khalti/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pidx }),
          });
          const lookupData = (await lookupRes.json()) as {
            transaction?: Transaction;
            error?: string;
          };

          if (!lookupRes.ok) {
            setCallbackBanner({
              tone: "error",
              text: lookupData.error || "Could not verify Khalti payment.",
            });
          } else if (lookupData.transaction?.status === "Completed") {
            setCallbackBanner({
              tone: "success",
              text: `Khalti payment verified (${lookupData.transaction.title} · ${formatNpr(lookupData.transaction.amountPaisa).formatted}).`,
            });
          } else if (lookupData.transaction?.status === "Canceled") {
            setCallbackBanner({
              tone: "warning",
              text: "Khalti payment was canceled. Your wallet balance is unchanged.",
            });
          } else {
            setCallbackBanner({
              tone: "warning",
              text: `Khalti status: ${lookupData.transaction?.status ?? "Pending"}.`,
            });
          }
        } catch {
          setCallbackBanner({
            tone: "error",
            text: "Failed to verify Khalti return callback.",
          });
        } finally {
          window.history.replaceState({}, "", "/about");
        }
      }
      await loadDashboard(false);
    }

    void init();
  }, [loadDashboard]);

  function openKhaltiSheet(mode: "send" | "request") {
    setSheetMode(mode);
    setSheetOpen(true);
  }

  if (loading) {
    return (
      <>
        <DashboardSkeleton />
        <BottomNav />
      </>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 pb-28 text-[#0f172a]">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#fecaca] bg-white p-6">
          <h1 className="text-xl font-bold">Wallet unavailable</h1>
          <p className="mt-2 text-sm text-[#475569]">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadDashboard(false);
            }}
            className="mt-4 rounded-xl bg-[#0b0f17] px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (!data) return null;

  const balanceParts = formatNpr(data.wallet.balancePaisa);
  const savingParts = formatNpr(data.stats.goalsSavedPaisa);
  const billsParts = formatNpr(data.stats.monthBillsPaisa);
  const goalsProgress =
    data.stats.goalsTargetPaisa > 0
      ? Math.min(
          Math.round(
            (data.stats.goalsSavedPaisa / data.stats.goalsTargetPaisa) * 100
          ),
          100
        )
      : 0;
  const billsShare =
    data.stats.monthSpendPaisa > 0
      ? Math.min(
          Math.round(
            (data.stats.monthBillsPaisa / data.stats.monthSpendPaisa) * 100
          ),
          100
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" title="NOVA Home" className="transition hover:opacity-85">
              <LogoMark size={40} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                My Wallet
              </h1>
              <p className="text-[13px] text-[#475569]">
                NOVA Finance · Khalti ID {data.wallet.khaltiId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* <span
              title={
                data.storageMode === "neon"
                  ? "Connected to Neon Serverless Postgres"
                  : "Using local .data JSON store until DATABASE_URL is configured"
              }
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex ${
                data.storageMode === "neon"
                  ? "border-[#bbf7d0] bg-[#dcfce7] text-[#14532d]"
                  : "border-[#dfe7f0] bg-white text-[#475569]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  data.storageMode === "neon" ? "bg-[#15803d]" : "bg-[#0284c7]"
                }`}
              />
              {data.storageMode === "neon" ? "Neon DB" : "Local Store"}
            </span> */}

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              aria-label="Refresh wallet data"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe7f0] bg-white text-[#475569] transition hover:bg-[#eaf0f6] hover:text-[#0f172a]"
            >
              <MdRefresh
                size={19}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <Image
              src="/kaladevi1.png"
              alt={data.wallet.ownerName}
              width={44}
              height={44}
              className="h-10 w-10 rounded-full border border-[#dfe7f0] object-cover sm:h-11 sm:w-11"
            />
          </div>
        </header>

        {callbackBanner && (
          <div
            role="status"
            className={`mt-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              callbackBanner.tone === "success"
                ? "border-[#bbf7d0] bg-[#dcfce7] text-[#14532d]"
                : callbackBanner.tone === "warning"
                  ? "border-[#fde68a] bg-[#fef3c7] text-[#78350f]"
                  : "border-[#fecaca] bg-[#fee2e2] text-[#7f1d1d]"
            }`}
          >
            <span>{callbackBanner.text}</span>
            <button
              type="button"
              onClick={() => setCallbackBanner(null)}
              className="text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Total Balance + Send & Request with Khalti */}
        <section className="mt-6 rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#94a3b8]">Available balance</p>
              <h2 className="num mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Rs. {balanceParts.whole}
                <span className="text-[#64748b]">.{balanceParts.decimals}</span>
              </h2>
              <p className="num mt-2 text-sm text-[#94a3b8]">
                {data.stats.pendingRequestsCount > 0
                  ? `${data.stats.pendingRequestsCount} pending Khalti ${
                      data.stats.pendingRequestsCount === 1
                        ? "request"
                        : "requests"
                    } (${formatNpr(data.stats.pendingRequestsPaisa).formatted})`
                  : "Your money, in perspective."}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#1e293b] bg-[#131a26] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
              <span className="text-xs font-medium text-[#e2e8f0]">
                {data.khaltiMode === "live"
                  ? "Khalti API v2"
                  : "Khalti Sandbox"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openKhaltiSheet("send")}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#38bdf8] px-5 text-sm font-semibold text-[#0b0f17] transition hover:bg-[#7dd3fc]"
            >
              Send via Khalti
              <GoArrowUpRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => openKhaltiSheet("request")}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#334155] bg-[#131a26] px-5 text-sm font-semibold text-white transition hover:border-[#475569] hover:bg-[#1e293b]"
            >
              Request via Khalti
              <GoArrowDownLeft size={18} />
            </button>
          </div>
        </section>

        {/* Saving and Bills summary */}
        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/goal"
            className="block rounded-2xl border border-[#dfe7f0] bg-white p-5 transition-colors hover:border-[#bae6fd]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#475569]">Savings Goals</p>
              <MdSavings size={20} className="text-[#0369a1]" aria-hidden="true" />
            </div>

            <p className="num mt-2 text-2xl font-bold text-[#0f172a]">
              Rs. {savingParts.whole}
              <span className="text-[#475569]">.{savingParts.decimals}</span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaf0f6]">
              <div
                className="h-full rounded-full bg-[#0284c7] transition-[width] duration-300"
                style={{ width: `${goalsProgress}%` }}
              />
            </div>
            <p className="num mt-2 text-[13px] text-[#475569]">
              {goalsProgress}% of {formatNpr(data.stats.goalsTargetPaisa).formatted} target
            </p>
          </Link>

          <Link
            href="/overview"
            className="block rounded-2xl border border-[#dfe7f0] bg-white p-5 transition-colors hover:border-[#bae6fd]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#475569]">
                Bills & Subscriptions
              </p>
              <AiFillFileText size={19} className="text-[#475569]" aria-hidden="true" />
            </div>

            <p className="num mt-2 text-2xl font-bold text-[#0f172a]">
              Rs. {billsParts.whole}
              <span className="text-[#475569]">.{billsParts.decimals}</span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaf0f6]">
              <div
                className="h-full rounded-full bg-[#0b0f17] transition-[width] duration-300"
                style={{ width: `${billsShare}%` }}
              />
            </div>
            <p className="num mt-2 text-[13px] text-[#475569]">
              {billsShare}% of this month&apos;s total spend
            </p>
          </Link>
        </section>

        {/* Transactions section with built-in search */}
        <TransactionSection
          transactions={data.transactions}
          onRefresh={() => loadDashboard(true)}
        />
      </div>

      <KhaltiActionSheet
        key={`${sheetMode}-${sheetOpen ? "open" : "closed"}`}
        open={sheetOpen}
        initialMode={sheetMode}
        balancePaisa={data.wallet.balancePaisa}
        khaltiMode={data.khaltiMode}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => {
          void loadDashboard(true);
        }}
      />

      <BottomNav />
    </main>
  );
}
