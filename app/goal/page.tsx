"use client";

import { useState, type FormEvent } from "react";
import { MdSavings, MdAdd, MdArrowBack } from "react-icons/md";
import { FaArrowUp, FaBullseye, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

type Goal = {
  id: number;
  name: string;
  target: number;
  saved: number;
  date: string;
};

export default function Goal() {
  const router = useRouter();

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      name: "New Laptop",
      target: 100000,
      saved: 35000,
      date: "2027-03-01",
    },
    {
      id: 2,
      name: "Emergency Fund",
      target: 50000,
      saved: 18000,
      date: "2027-01-01",
    },
    {
      id: 3,
      name: "Dream Vacation",
      target: 80000,
      saved: 12000,
      date: "2027-06-01",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contributions, setContributions] = useState<Record<number, string>>(
    {}
  );

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const remaining = Math.max(totalTarget - totalSaved, 0);
  const overallProgress =
    totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const target = Number(targetAmount);
    const saved = Number(savedAmount || 0);

    if (
      !goalName.trim() ||
      !targetAmount ||
      target <= 0 ||
      saved < 0 ||
      saved > target ||
      !targetDate
    ) {
      alert("Please enter valid goal details.");
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      name: goalName.trim(),
      target,
      saved,
      date: targetDate,
    };

    setGoals((previousGoals) => [...previousGoals, newGoal]);
    setGoalName("");
    setTargetAmount("");
    setSavedAmount("");
    setTargetDate("");
    setShowForm(false);
  }

  function addSavings(goalId: number) {
    const amount = Number(contributions[goalId]);

    if (!amount || amount <= 0) {
      alert("Please enter a valid saving amount.");
      return;
    }

    setGoals((previousGoals) =>
      previousGoals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              saved: Math.min(goal.saved + amount, goal.target),
            }
          : goal
      )
    );

    setContributions((previous) => ({
      ...previous,
      [goalId]: "",
    }));
  }

  function formatMoney(amount: number) {
    return `Rs. ${amount.toLocaleString("en-IN")}`;
  }

  return (
    <main className="min-h-screen bg-sky-300 px-4 py-5 text-black sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/about")}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
          >
            <MdArrowBack size={20} />
            Back
          </button>

          <p className="text-sm font-bold tracking-[0.25em]">NOVA</p>
        </header>

        {/* Page title */}
        <section className="mb-6">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-700">
            Your future starts today
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold sm:text-5xl">My Goals</h1>
              <p className="mt-2 text-sm text-gray-700 sm:text-base">
                Small savings today, big dreams tomorrow.
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <MdAdd size={21} />
              Create Goal
            </button>
          </div>
        </section>

        {/* Overall savings card */}
        <section className="rounded-3xl bg-black p-5 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">TOTAL SAVED</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                {formatMoney(totalSaved)}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Out of {formatMoney(totalTarget)}
              </p>
            </div>

            <div className="rounded-2xl bg-sky-300 p-3 text-black">
              <MdSavings size={30} />
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between text-sm">
            <span className="text-gray-300">Overall progress</span>
            <span className="font-semibold">
              {overallProgress.toFixed(0)}%
            </span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-sky-300 transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-gray-300">
            <FaArrowUp className="text-sky-300" />
            {formatMoney(remaining)} left to reach all your goals
          </div>
        </section>

        {/* Summary cards */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active Goals</p>
              <FaBullseye size={20} />
            </div>
            <h3 className="mt-3 text-3xl font-bold">{goals.length}</h3>
            <p className="mt-1 text-xs text-gray-500">
              Goals you are working toward
            </p>
          </div>

          <div className="rounded-2xl bg-sky-200 p-5">
            <p className="text-sm text-gray-600">Total Target</p>
            <h3 className="mt-3 text-2xl font-bold">
              {formatMoney(totalTarget)}
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              Your savings target
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="text-sm text-gray-500">Amount Remaining</p>
            <h3 className="mt-3 text-2xl font-bold">
              {formatMoney(remaining)}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Keep going, you can do it!
            </p>
          </div>
        </section>

        {/* Create goal form */}
        {showForm && (
          <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7">
            <h2 className="text-2xl font-bold">Create a New Goal</h2>
            <p className="mt-1 text-sm text-gray-500">
              Set a target and start saving for something important.
            </p>

            <form onSubmit={createGoal} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Goal name
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(event) => setGoalName(event.target.value)}
                  placeholder="e.g. Buy a laptop"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target amount (Rs.)
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetAmount}
                  onChange={(event) => setTargetAmount(event.target.value)}
                  placeholder="e.g. 100000"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Already saved (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={savedAmount}
                  onChange={(event) => setSavedAmount(event.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Target date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                >
                  Save Goal
                </button>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full bg-gray-100 px-6 py-3 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Goal cards */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Saving Plans</h2>
            <span className="text-sm text-gray-700">
              {goals.length} goals
            </span>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center">
              <MdSavings className="mx-auto" size={42} />
              <h3 className="mt-3 text-xl font-bold">No goals yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create your first saving goal and start tracking your progress.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {goals.map((goal) => {
                const progress = Math.min(
                  (goal.saved / goal.target) * 100,
                  100
                );
                const completed = goal.saved >= goal.target;

                return (
                  <article
                    key={goal.id}
                    className="rounded-3xl bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-sky-200 p-3">
                          <MdSavings size={25} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{goal.name}</h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {completed ? "Goal completed!" : "Saving in progress"}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold">
                        {progress.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">SAVED</p>
                        <p className="mt-1 text-xl font-bold">
                          {formatMoney(goal.saved)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">TARGET</p>
                        <p className="mt-1 font-semibold">
                          {formatMoney(goal.target)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-black transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <FaCalendarAlt />
                      Target date: {goal.date}
                    </div>

                    {!completed && (
                      <div className="mt-5 flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max={goal.target - goal.saved}
                          value={contributions[goal.id] ?? ""}
                          onChange={(event) =>
                            setContributions((previous) => ({
                              ...previous,
                              [goal.id]: event.target.value,
                            }))
                          }
                          placeholder="Amount to save (Rs.)"
                          className="min-w-0 flex-1 rounded-xl bg-gray-100 px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                        />

                        <button
                          onClick={() => addSavings(goal.id)}
                          className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                          + Add
                        </button>
                      </div>
                    )}

                    {completed && (
                      <div className="mt-5 rounded-xl bg-sky-100 p-3 text-center text-sm font-semibold">
                        You reached your goal!
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom message */}
        <section className="mt-8 rounded-3xl bg-sky-200 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold">Keep saving. Keep growing.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-700">
            Every small amount brings you one step closer to your dreams.
          </p>
        </section>
      </div>
    </main>
  );
}