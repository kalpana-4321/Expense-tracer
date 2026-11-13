"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import {
  FaArrowDown,
  FaArrowRight,
  FaBus,
  FaShoppingBag,
  FaUtensils,
  FaWallet,
} from "react-icons/fa";
import { MdBolt, MdSavings } from "react-icons/md";
import { BottomNav } from "@/components/BottomNav";
import { OverviewSkeleton } from "@/components/Skeleton";
import { formatNpr, formatNprCompact } from "@/lib/format";
import type { OverviewResponse } from "@/lib/types";

export default function Overview() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInsight, setShowInsight] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalStatus, setGoalStatus] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);

  const loadOverview = useCallback(async (month?: string) => {
    setError("");
    try {
      const qs = month ? `?month=${encodeURIComponent(month)}` : "";
      const res = await fetch(`/api/overview${qs}`, { cache: "no-store" });
      const json = (await res.json()) as OverviewResponse & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Unable to load overview analytics.");
      }
      setData(json);
      setSelectedMonth(json.selectedMonth);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load overview."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/overview", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as OverviewResponse & {
          error?: string;
        };
        if (!res.ok) {
          throw new Error(json.error || "Unable to load overview analytics.");
        }
        if (active) {
          setData(json);
          setSelectedMonth(json.selectedMonth);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load overview."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGoalStatus(null);
    const parsed = Number(goalAmount);
    if (!goalName.trim() || !Number.isFinite(parsed) || parsed <= 0) {
      setGoalStatus({
        tone: "error",
        text: "Enter a goal name and target amount above Rs. 0.",
      });
      return;
    }

    setSavingGoal(true);
    try {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 6);
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goalName.trim(),
          targetNpr: parsed,
          savedNpr: 0,
          targetDate: targetDate.toISOString().slice(0, 10),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Unable to create goal.");
      }
      setGoalStatus({
        tone: "success",
        text: `Saved "${goalName.trim()}" (${formatNprCompact(parsed * 100)}) to your goals.`,
      });
      setGoalName("");
      setGoalAmount("");
      setShowGoalForm(false);
    } catch (err) {
      setGoalStatus({
        tone: "error",
        text: err instanceof Error ? err.message : "Could not save goal.",
      });
    } finally {
      setSavingGoal(false);
    }
  }

  function categoryIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("food")) return <FaUtensils size={15} />;
    if (lower.includes("shop")) return <FaShoppingBag size={15} />;
    if (lower.includes("transport")) return <FaBus size={15} />;
    if (lower.includes("bill") || lower.includes("sub")) return <MdBolt size={17} />;
    return <FaWallet size={15} />;
  }

  if (loading) {
    return (
      <>
        <OverviewSkeleton />
        <BottomNav />
      </>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 pb-28 text-[#0f172a]">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#fecaca] bg-white p-6">
          <h1 className="text-xl font-bold">Overview unavailable</h1>
          <p className="mt-2 text-sm text-[#475569]">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadOverview();
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
  const topCategory = data.categories[0];

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Overview
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              {topCategory
                ? `${topCategory.name} leads ${data.selectedMonth} spending at ${topCategory.percent}% of outgoings.`
                : `Cash flow and category totals for ${data.selectedMonth}.`}
            </p>
          </div>

          <label className="relative flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white px-3.5 text-sm font-medium text-[#0f172a]">
            <select
              aria-label="Select month"
              value={selectedMonth}
              onChange={(event) => {
                const next = event.target.value;
                setSelectedMonth(next);
                setShowInsight(false);
                void loadOverview(next);
              }}
              className="cursor-pointer appearance-none bg-transparent pr-5 outline-none"
            >
              {data.availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <TiArrowSortedDown
              size={16}
              className="pointer-events-none absolute right-2.5 text-[#475569]"
            />
          </label>
        </header>

        {/* Divided KPI Strip */}
        <section className="mt-6 grid grid-cols-1 divide-y divide-[#dfe7f0] rounded-2xl border border-[#dfe7f0] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <p className="text-xs font-medium text-[#64748b]">
              Available Balance
            </p>
            <p className="num mt-1.5 text-2xl font-bold text-[#0f172a]">
              Rs. {balanceParts.whole}
              <span className="text-[#64748b]">.{balanceParts.decimals}</span>
            </p>
            <p className="mt-1 text-xs text-[#64748b]">
              {data.storageMode === "neon" ? "Neon Postgres" : "Local Store"}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#64748b]">
              {data.selectedMonth} Income
            </p>
            <p className="num mt-1.5 text-2xl font-bold text-[#15803d]">
              {formatNpr(data.totals.incomePaisa).formatted}
            </p>
            <p className="num mt-1 text-xs text-[#64748b]">
              {data.totals.savingsRatio}% retained after spend
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#64748b]">
              {data.selectedMonth} Spending
            </p>
            <p className="num mt-1.5 text-2xl font-bold text-[#0f172a]">
              {formatNpr(data.totals.spendPaisa).formatted}
            </p>
            <p className="num mt-1 text-xs text-[#64748b]">
              {data.totals.spendRatio}% of monthly flow
            </p>
          </div>
        </section>

        {/* Weekly Spending Chart */}
        <section className="mt-4 rounded-2xl border border-[#dfe7f0] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">7-Day Spending</h2>
              <p className="mt-0.5 text-sm text-[#475569]">
                Completed outgoings across the past seven days
              </p>
            </div>
            <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-medium text-[#0c4a6e]">
              {data.selectedMonth}
            </span>
          </div>

          <div className="mt-6 flex h-44 items-end justify-between gap-2 border-b border-[#dfe7f0] pb-2 sm:h-52 sm:gap-4">
            {data.weekly.map((day, index) => {
              const isPeak =
                day.amountPaisa > 0 &&
                day.amountPaisa ===
                  Math.max(...data.weekly.map((d) => d.amountPaisa));

              return (
                <div
                  key={`${day.label}-${index}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="num text-[11px] text-[#64748b]">
                    {day.amountPaisa > 0
                      ? formatNprCompact(day.amountPaisa).replace("Rs. ", "")
                      : "0"}
                  </span>
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className={`w-full max-w-11 rounded-t-md transition-[height] duration-300 ${
                        day.amountPaisa === 0
                          ? "bg-[#eaf0f6]"
                          : isPeak
                            ? "bg-[#0b0f17]"
                            : "bg-[#38bdf8]"
                      }`}
                      style={{
                        height:
                          day.amountPaisa === 0
                            ? "4px"
                            : `${Math.max(day.percentOfMax, 10)}%`,
                      }}
                      title={`${day.label}: ${formatNpr(day.amountPaisa).formatted}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2 sm:gap-4">
            {data.weekly.map((day, index) => (
              <span
                key={`label-${day.label}-${index}`}
                className="flex-1 text-center text-xs font-medium text-[#64748b]"
              >
                {day.label}
              </span>
            ))}
          </div>
        </section>

        {/* Categories + Actions */}
        <section className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {/* Categories */}
          <div className="rounded-2xl border border-[#dfe7f0] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Spending Categories</h2>
                <p className="mt-0.5 text-sm text-[#475569]">
                  Ranked by completed {data.selectedMonth} spend
                </p>
              </div>
              <FaWallet className="text-[#475569]" size={17} aria-hidden="true" />
            </div>

            {data.categories.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[#cbd5e1] p-6 text-center text-sm text-[#475569]">
                No outgoing transactions recorded in {data.selectedMonth}.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {data.categories.map((category, idx) => (
                  <div key={category.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[#0369a1]" aria-hidden="true">
                          {categoryIcon(category.name)}
                        </span>
                        <span className="text-sm font-medium text-[#0f172a]">
                          {category.name}
                        </span>
                        <span className="num text-[13px] text-[#475569]">
                          ({category.count})
                        </span>
                      </div>
                      <span className="num text-sm font-semibold text-[#0f172a]">
                        {formatNpr(category.amountPaisa).formatted}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#eaf0f6]">
                      <div
                        className={`h-full rounded-full transition-[width] duration-300 ${
                          idx === 0 ? "bg-[#0b0f17]" : "bg-[#0284c7]"
                        }`}
                        style={{ width: `${Math.max(category.percent, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insight & Quick Goal */}
          <div className="flex h-full flex-col gap-4">
            <div className="rounded-2xl border border-[#dfe7f0] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Monthly Snapshot</h2>
                <FaArrowDown
                  className="rotate-45 text-[#0369a1]"
                  size={16}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm text-[#475569]">
                Compare your net savings against bills and recurring costs.
              </p>

              <button
                type="button"
                onClick={() => setShowInsight((prev) => !prev)}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 text-sm font-medium text-[#0f172a] transition-colors hover:bg-[#eaf0f6]"
              >
                {showInsight ? "Hide breakdown" : "View breakdown"}
                <FaArrowRight size={13} />
              </button>

              {showInsight && (
                <div className="mt-4 space-y-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 text-sm text-[#334155]">
                  <p>
                    Net retained in {data.selectedMonth}:{" "}
                    <strong className="num text-[#0f172a]">
                      {formatNpr(data.totals.netSavingsPaisa).formatted}
                    </strong>
                  </p>
                  <p>
                    Bills & subscriptions total{" "}
                    <strong className="num text-[#0f172a]">
                      {formatNpr(data.totals.billsPaisa).formatted}
                    </strong>
                    .
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-5 text-white sm:p-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Quick Savings Goal</h2>
                  <MdSavings
                    size={20}
                    className="text-[#38bdf8]"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-2 text-sm text-[#94a3b8]">
                  Add a savings target straight to your database.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowGoalForm((prev) => !prev)}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-[#38bdf8] px-4 text-sm font-semibold text-[#0b0f17] transition-colors hover:bg-[#7dd3fc]"
                >
                  {showGoalForm ? "Close" : "Add a new goal"}
                  <FaArrowRight size={13} />
                </button>

              {goalStatus && (
                <p
                  className={`mt-3 rounded-xl px-3 py-2 text-xs font-medium ${
                    goalStatus.tone === "success"
                      ? "bg-[#14532d]/40 text-[#86efac]"
                      : "bg-[#7f1d1d]/40 text-[#fca5a5]"
                  }`}
                >
                  {goalStatus.text}
                </p>
              )}

              {showGoalForm && (
                <form
                  onSubmit={handleCreateGoal}
                  className="mt-4 space-y-3 rounded-xl bg-white p-4 text-[#0f172a]"
                >
                  <label className="block text-xs font-medium text-[#334155]">
                    Goal name
                    <input
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="e.g. Studio Monitor"
                      required
                      className="mt-1 h-9 w-full rounded-lg border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#0284c7]"
                    />
                  </label>

                  <label className="block text-xs font-medium text-[#334155]">
                    Target amount (Rs.)
                    <input
                      type="number"
                      min="1"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="45000"
                      required
                      className="num mt-1 h-9 w-full rounded-lg border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#0284c7]"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={savingGoal}
                    className="h-9 w-full rounded-lg bg-[#0b0f17] text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:opacity-60"
                  >
                    {savingGoal ? "Saving..." : "Create Goal"}
                  </button>
                </form>
              )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
