"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBus,
  FaShoppingBag,
  FaSpotify,
  FaUtensils,
  FaYoutube,
} from "react-icons/fa";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import { MdBolt, MdClose, MdSearch, MdSwapHoriz } from "react-icons/md";
import { formatRelativeTime, formatSignedNpr } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface TransactionSectionProps {
  transactions: Transaction[];
  onRefresh: () => Promise<void>;
}

type DirectionFilter = "all" | "debit" | "credit" | "request";

const CATEGORY_ICON_MAP: Record<
  string,
  { ink: string; Icon: typeof FaUtensils }
> = {
  Subscription: { ink: "text-[#15803d]", Icon: FaSpotify },
  Transport: { ink: "text-[#334155]", Icon: FaBus },
  Food: { ink: "text-[#475569]", Icon: FaUtensils },
  Shopping: { ink: "text-[#0369a1]", Icon: FaShoppingBag },
  Bills: { ink: "text-[#475569]", Icon: MdBolt },
  Income: { ink: "text-[#15803d]", Icon: GoArrowDownLeft },
  "Split Bill": { ink: "text-[#0369a1]", Icon: MdSwapHoriz },
  Transfer: { ink: "text-[#0369a1]", Icon: GoArrowUpRight },
};

function getTransactionVisual(tx: Transaction) {
  const lower = tx.title.toLowerCase();
  if (lower.includes("youtube")) {
    return { ink: "text-[#b91c1c]", Icon: FaYoutube };
  }
  return (
    CATEGORY_ICON_MAP[tx.category] ?? {
      ink: "text-[#475569]",
      Icon: MdSwapHoriz,
    }
  );
}

function StatusPill({ status }: { status: Transaction["status"] }) {
  if (status === "Completed") return null;

  const styles =
    status === "Requested" || status === "Pending" || status === "Initiated"
      ? "bg-[#fef3c7] text-[#78350f]"
      : "bg-[#fee2e2] text-[#7f1d1d]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-medium ${styles}`}
    >
      {status}
    </span>
  );
}

export function TransactionSection({
  transactions,
  onRefresh,
}: TransactionSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<DirectionFilter>("all");
  const [verifyingPidx, setVerifyingPidx] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = transactions.filter((tx) => {
    if (filter !== "all" && tx.direction !== filter) return false;
    if (!normalizedQuery) return true;
    const haystack = [
      tx.title,
      tx.counterparty,
      tx.category,
      tx.khaltiPidx ?? "",
      tx.note ?? "",
      tx.status,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  async function handleVerify(pidx: string) {
    setVerifyingPidx(pidx);
    setActionMessage(null);
    try {
      const res = await fetch("/api/khalti/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pidx }),
      });
      const data = (await res.json()) as {
        transaction?: Transaction;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Lookup failed");
      }
      await onRefresh();
      setActionMessage(
        data.transaction
          ? `Status for ${data.transaction.title}: ${data.transaction.status}`
          : "Status checked."
      );
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Could not check Khalti status."
      );
    } finally {
      setVerifyingPidx(null);
    }
  }

  return (
    <section
      aria-labelledby="transactions-heading"
      className="mt-6 rounded-2xl border border-[#dfe7f0] bg-white p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 id="transactions-heading" className="text-lg font-semibold">
              Transactions
            </h2>
            <span className="num text-[13px] text-[#475569]">
              {filtered.length} of {transactions.length}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#475569]">
            Khalti transfers, bills, and payment requests
          </p>
        </div>

        {/* Transaction search placed directly inside the Transactions section */}
        <div className="relative w-full sm:w-72">
          <MdSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]"
            size={18}
          />
          <input
            type="search"
            aria-label="Search transactions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, category, PIDX..."
            className="h-10 w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] pl-9 pr-9 text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#475569] focus:border-[#0284c7] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear transaction search"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#475569] hover:bg-[#e2e8f0] hover:text-[#0f172a]"
            >
              <MdClose size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Direction filters & Overview link */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter transactions"
        >
          {(
            [
              { id: "all", label: "All" },
              { id: "debit", label: "Sent" },
              { id: "credit", label: "Received" },
              { id: "request", label: "Requests" },
            ] as const
          ).map((tab) => {
            const selected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-pressed={selected}
                className={`h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors ${
                  selected
                    ? "bg-[#0b0f17] text-white"
                    : "border border-[#dfe7f0] bg-[#f4f7fb] text-[#475569] hover:text-[#0f172a]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Link
          href="/overview"
          className="text-sm font-medium text-[#0369a1] hover:underline"
        >
          Full analytics
        </Link>
      </div>

      {actionMessage && (
        <p className="mt-3 rounded-xl border border-[#bae6fd] bg-[#f0f9ff] px-3.5 py-2 text-[13px] font-medium text-[#0c4a6e]">
          {actionMessage}
        </p>
      )}

      {/* Transaction list */}
      <div className="mt-4 divide-y divide-[#edf2f7]">
        {filtered.length === 0 ? (
          <div className="my-2 rounded-xl border border-dashed border-[#cbd5e1] p-6 text-center">
            <p className="text-sm font-medium text-[#0f172a]">
              {normalizedQuery
                ? `No transactions matching "${searchQuery.trim()}"`
                : "No transactions in this filter yet"}
            </p>
            <p className="mt-1 text-[13px] text-[#475569]">
              Try another keyword or clear your active filter.
            </p>
            {(normalizedQuery || filter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                className="mt-3 rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-[13px] font-medium text-[#0f172a] hover:bg-[#f4f7fb]"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((tx) => {
            const visual = getTransactionVisual(tx);
            const Icon = visual.Icon;
            const isCredit = tx.direction === "credit";
            const isPendingKhalti =
              tx.khaltiPidx &&
              (tx.status === "Initiated" ||
                tx.status === "Pending" ||
                tx.status === "Requested");

            return (
              <div
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3.5"
              >
                <div className="flex min-w-[180px] flex-1 items-start gap-3 overflow-hidden pr-1">
                  <Icon
                    className={`mt-1 h-4 w-4 shrink-0 ${visual.ink}`}
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#0f172a]">
                        {tx.title}
                      </p>
                      <StatusPill status={tx.status} />
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-[#475569]">
                      {formatRelativeTime(tx.createdAt)} · {tx.category}
                      {tx.note ? ` · ${tx.note}` : ""}
                    </p>
                  </div>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2.5">
                  {isPendingKhalti && tx.paymentUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (tx.paymentUrl!.startsWith("/")) {
                          router.push(tx.paymentUrl!);
                        } else {
                          window.location.href = tx.paymentUrl!;
                        }
                      }}
                      className="rounded-lg bg-[#e0f2fe] px-2.5 py-1 text-[13px] font-semibold text-[#0c4a6e] transition-colors hover:bg-[#bae6fd]"
                    >
                      {tx.direction === "request" ? "Pay Link" : "Checkout"}
                    </button>
                  )}

                  {isPendingKhalti && tx.khaltiPidx && (
                    <button
                      type="button"
                      disabled={verifyingPidx === tx.khaltiPidx}
                      onClick={() => handleVerify(tx.khaltiPidx!)}
                      className="rounded-lg border border-[#cbd5e1] bg-white px-2.5 py-1 text-[13px] font-medium text-[#334155] transition-colors hover:bg-[#f4f7fb] disabled:opacity-50"
                    >
                      {verifyingPidx === tx.khaltiPidx ? "Checking..." : "Verify"}
                    </button>
                  )}

                  <div className="text-right">
                    <p
                      className={`num text-sm font-semibold ${
                        isCredit ? "text-[#15803d]" : "text-[#0f172a]"
                      }`}
                    >
                      {formatSignedNpr(tx.amountPaisa, tx.direction)}
                    </p>
                    {tx.khaltiPidx && (
                      <p className="mt-0.5 font-mono text-xs text-[#475569]">
                        {tx.khaltiPidx.length > 16
                          ? `${tx.khaltiPidx.slice(0, 14)}…`
                          : tx.khaltiPidx}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
