"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FaArrowUp, FaBullseye, FaCalendarAlt } from "react-icons/fa";
import { MdAdd, MdDeleteOutline, MdSavings } from "react-icons/md";
import { BottomNav } from "@/components/BottomNav";
import { GoalsSkeleton } from "@/components/Skeleton";
import { formatNprCompact } from "@/lib/format";
import type { Goal, StorageMode } from "@/lib/types";

export default function GoalPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [storageMode, setStorageMode] = useState<StorageMode>("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contributingId, setContributingId] = useState<number | null>(null);
  const [contributions, setContributions] = useState<Record<number, string>>(
    {}
  );
  const [goalErrors, setGoalErrors] = useState<Record<number, string>>({});

  const loadGoals = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/goals", { cache: "no-store" });
      const json = (await res.json()) as {
        goals?: Goal[];
        storageMode?: StorageMode;
        error?: string;
      };
      if (!res.ok || !json.goals) {
        throw new Error(json.error || "Unable to load savings goals.");
      }
      setGoals(json.goals);
      if (json.storageMode) setStorageMode(json.storageMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/goals", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as {
          goals?: Goal[];
          storageMode?: StorageMode;
          error?: string;
        };
        if (!res.ok || !json.goals) {
          throw new Error(json.error || "Unable to load savings goals.");
        }
        if (active) {
          setGoals(json.goals);
          if (json.storageMode) setStorageMode(json.storageMode);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load goals."
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

  const totalTargetPaisa = goals.reduce((sum, g) => sum + g.targetPaisa, 0);
  const totalSavedPaisa = goals.reduce((sum, g) => sum + g.savedPaisa, 0);
  const remainingPaisa = Math.max(totalTargetPaisa - totalSavedPaisa, 0);
  const overallProgress =
    totalTargetPaisa > 0
      ? Math.min((totalSavedPaisa / totalTargetPaisa) * 100, 100)
      : 0;

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const targetNpr = Number(targetAmount);
    const savedNpr = Number(savedAmount || 0);

    if (
      !goalName.trim() ||
      !Number.isFinite(targetNpr) ||
      targetNpr <= 0 ||
      savedNpr < 0 ||
      savedNpr > targetNpr ||
      !targetDate
    ) {
      setFeedback({
        tone: "error",
        text: "Enter a goal name, valid target amount, saved amount <= target, and target date.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: goalName.trim(),
          targetNpr,
          savedNpr,
          targetDate,
        }),
      });
      const json = (await res.json()) as { goal?: Goal; error?: string };
      if (!res.ok || !json.goal) {
        throw new Error(json.error || "Could not create goal.");
      }
      setGoals((prev) => [...prev, json.goal!]);
      setGoalName("");
      setTargetAmount("");
      setSavedAmount("");
      setTargetDate("");
      setShowForm(false);
      setFeedback({
        tone: "success",
        text: `Goal "${json.goal.name}" saved.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to save goal.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function addSavings(goalId: number) {
    setFeedback(null);
    setGoalErrors((prev) => ({ ...prev, [goalId]: "" }));
    const amountNpr = Number(contributions[goalId]);
    if (!Number.isFinite(amountNpr) || amountNpr <= 0) {
      setGoalErrors((prev) => ({
        ...prev,
        [goalId]: "Enter an amount above Rs. 0 to add savings.",
      }));
      return;
    }

    setContributingId(goalId);
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goalId, amountNpr }),
      });
      const json = (await res.json()) as { goal?: Goal; error?: string };
      if (!res.ok || !json.goal) {
        throw new Error(json.error || "Unable to update goal.");
      }
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? json.goal! : g))
      );
      setContributions((prev) => ({ ...prev, [goalId]: "" }));
      setGoalErrors((prev) => ({ ...prev, [goalId]: "" }));
      setFeedback({
        tone: "success",
        text: `Added ${formatNprCompact(amountNpr * 100)} to ${json.goal.name}.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not add savings.";
      setGoalErrors((prev) => ({ ...prev, [goalId]: msg }));
    } finally {
      setContributingId(null);
    }
  }

  async function deleteGoal(goal: Goal) {
    setFeedback(null);
    try {
      const res = await fetch(`/api/goals?id=${goal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error || "Could not remove goal.");
      }
      setGoals((prev) => prev.filter((g) => g.id !== goal.id));
      setFeedback({
        tone: "success",
        text: `Removed "${goal.name}".`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Delete failed.",
      });
    }
  }

  if (loading) {
    return (
      <>
        <GoalsSkeleton />
        <BottomNav />
      </>
    );
  }

  if (error && goals.length === 0) {
    return (
      <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 pb-28 text-[#0f172a]">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#fecaca] bg-white p-6">
          <h1 className="text-xl font-bold">Goals unavailable</h1>
          <p className="mt-2 text-sm text-[#475569]">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadGoals();
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

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Savings Goals
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              Synced with {storageMode === "neon" ? "Neon Postgres" : "Local Store"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0b0f17] px-4 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
          >
            <MdAdd size={18} />
            {showForm ? "Close Form" : "Create Goal"}
          </button>
        </header>

        {feedback && (
          <div
            role="status"
            className={`mt-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              feedback.tone === "success"
                ? "border-[#bbf7d0] bg-[#dcfce7] text-[#14532d]"
                : "border-[#fecaca] bg-[#fee2e2] text-[#7f1d1d]"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Overall savings card */}
        <section className="mt-6 rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-6 text-white sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#94a3b8]">Total saved across goals</p>
              <h2 className="num mt-2 text-3xl font-bold sm:text-4xl">
                {formatNprCompact(totalSavedPaisa)}
              </h2>
              <p className="num mt-1 text-sm text-[#94a3b8]">
                Target total: {formatNprCompact(totalTargetPaisa)}
              </p>
            </div>

            <MdSavings size={24} className="shrink-0 text-[#38bdf8]" aria-hidden="true" />
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-[#cbd5e1]">Overall progress</span>
            <span className="num font-semibold text-[#38bdf8]">
              {overallProgress.toFixed(0)}%
            </span>
          </div>

          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#1e293b]">
            <div
              className="h-full rounded-full bg-[#38bdf8] transition-[width] duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="num mt-4 flex items-center gap-2 text-sm text-[#cbd5e1]">
            <FaArrowUp className="text-[#38bdf8]" size={13} />
            {formatNprCompact(remainingPaisa)} remaining to hit every goal
          </div>
        </section>

        {/* Summary strip */}
        <section className="mt-4 grid grid-cols-1 divide-y divide-[#dfe7f0] rounded-2xl border border-[#dfe7f0] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[#64748b]">Active Goals</p>
              <FaBullseye size={14} className="text-[#0284c7]" />
            </div>
            <p className="num mt-2 text-2xl font-bold">{goals.length}</p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#64748b]">Total Target</p>
            <p className="num mt-2 text-2xl font-bold">
              {formatNprCompact(totalTargetPaisa)}
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-medium text-[#64748b]">Remaining</p>
            <p className="num mt-2 text-2xl font-bold">
              {formatNprCompact(remainingPaisa)}
            </p>
          </div>
        </section>

        {/* Create goal form */}
        {showForm && (
          <section className="mt-4 rounded-2xl border border-[#dfe7f0] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Create a New Goal</h2>
            <p className="mt-0.5 text-sm text-[#475569]">
              Set a target amount and deadline.
            </p>

            <form
              onSubmit={createGoal}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Goal name
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Bike Downpayment"
                  required
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] px-3.5 text-sm outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Target amount (Rs.)
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="100000"
                  required
                  className="num h-10 w-full rounded-xl border border-[#cbd5e1] px-3.5 text-sm outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Already saved (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={savedAmount}
                  onChange={(e) => setSavedAmount(e.target.value)}
                  placeholder="0"
                  className="num h-10 w-full rounded-xl border border-[#cbd5e1] px-3.5 text-sm outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Target date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="h-10 w-full rounded-xl border border-[#cbd5e1] px-3.5 text-sm outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="flex flex-wrap gap-2.5 sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-xl bg-[#0b0f17] px-5 text-sm font-semibold text-white hover:bg-[#1e293b] disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Goal"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-10 rounded-xl border border-[#cbd5e1] bg-white px-5 text-sm font-medium text-[#334155] hover:bg-[#f4f7fb]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Goal cards */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saving Plans</h2>
            <span className="num text-[13px] text-[#475569]">
              {goals.length} {goals.length === 1 ? "goal" : "goals"}
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-8 text-center">
              <MdSavings className="mx-auto text-[#0284c7]" size={36} />
              <h3 className="mt-3 text-base font-semibold">No goals yet</h3>
              <p className="mt-1 text-sm text-[#64748b]">
                Create your first saving goal to track progress against your
                wallet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {goals.map((goal) => {
                const progress = Math.min(
                  (goal.savedPaisa / goal.targetPaisa) * 100,
                  100
                );
                const completed = goal.savedPaisa >= goal.targetPaisa;
                const maxAddNpr = Math.max(
                  Math.ceil((goal.targetPaisa - goal.savedPaisa) / 100),
                  1
                );

                return (
                  <article
                    key={goal.id}
                    className="rounded-2xl border border-[#dfe7f0] bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <MdSavings
                          size={20}
                          className="shrink-0 text-[#0369a1]"
                          aria-hidden="true"
                        />
                        <div>
                          <h3 className="text-base font-semibold">
                            {goal.name}
                          </h3>
                          <p className="text-[13px] text-[#475569]">
                            {completed ? "Target reached" : "In progress"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`num rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            completed
                              ? "bg-[#dcfce7] text-[#14532d]"
                              : "bg-[#e0f2fe] text-[#0c4a6e]"
                          }`}
                        >
                          {progress.toFixed(0)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => void deleteGoal(goal)}
                          aria-label={`Delete ${goal.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#fee2e2] hover:text-[#b91c1c]"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#64748b]">Saved</p>
                        <p className="num mt-0.5 text-xl font-bold">
                          {formatNprCompact(goal.savedPaisa)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#64748b]">Target</p>
                        <p className="num mt-0.5 text-sm font-semibold text-[#334155]">
                          {formatNprCompact(goal.targetPaisa)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eaf0f6]">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ${
                          completed ? "bg-[#15803d]" : "bg-[#0b0f17]"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748b]">
                      <FaCalendarAlt size={11} />
                      <span>Target date: {goal.targetDate}</span>
                    </div>

                    {!completed ? (
                      <div className="mt-4 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max={maxAddNpr}
                            value={contributions[goal.id] ?? ""}
                            onChange={(e) =>
                              setContributions((prev) => ({
                                ...prev,
                                [goal.id]: e.target.value,
                              }))
                            }
                            placeholder="Add amount (Rs.)"
                            className="num h-10 min-w-0 flex-1 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 text-sm outline-none focus:border-[#0284c7] focus:bg-white"
                          />

                          <button
                            type="button"
                            disabled={contributingId === goal.id}
                            onClick={() => void addSavings(goal.id)}
                            className="h-10 rounded-xl bg-[#0b0f17] px-4 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:opacity-60"
                          >
                            {contributingId === goal.id ? "Saving..." : "+ Add"}
                          </button>
                        </div>
                        {goalErrors[goal.id] && (
                          <p className="rounded-lg bg-[#fee2e2] px-3 py-2 text-xs font-medium text-[#b91c1c]">
                            {goalErrors[goal.id]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl bg-[#dcfce7] px-3 py-2 text-center text-xs font-semibold text-[#14532d]">
                        Goal completed
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
