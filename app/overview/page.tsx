"use client";

import { useState } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaShoppingBag,
  FaUtensils,
  FaBus,
  FaArrowRight,
} from "react-icons/fa";
import { MdSavings } from "react-icons/md";

const monthlyData: Record<
  string,
  {
    spend: number;
    revenue: number;
    tax: number;
    weekly: number[];
    categories: { name: string; amount: number; percent: number }[];
  }
> = {
  January: {
    spend: 38,
    revenue: 52,
    tax: 10,
    weekly: [35, 60, 45, 80, 55, 70, 40],
    categories: [
      { name: "Food", amount: 3500, percent: 70 },
      { name: "Shopping", amount: 2200, percent: 48 },
      { name: "Transport", amount: 1200, percent: 30 },
    ],
  },
  February: {
    spend: 32,
    revenue: 58,
    tax: 10,
    weekly: [45, 30, 65, 50, 75, 40, 60],
    categories: [
      { name: "Food", amount: 2800, percent: 60 },
      { name: "Shopping", amount: 1800, percent: 40 },
      { name: "Transport", amount: 900, percent: 25 },
    ],
  },
  March: {
    spend: 42,
    revenue: 48,
    tax: 10,
    weekly: [55, 40, 70, 45, 85, 60, 50],
    categories: [
      { name: "Food", amount: 4200, percent: 80 },
      { name: "Shopping", amount: 2500, percent: 55 },
      { name: "Transport", amount: 1500, percent: 35 },
    ],
  },
  April: {
    spend: 35,
    revenue: 55,
    tax: 10,
    weekly: [30, 55, 40, 75, 50, 85, 60],
    categories: [
      { name: "Food", amount: 3200, percent: 65 },
      { name: "Shopping", amount: 2000, percent: 45 },
      { name: "Transport", amount: 1100, percent: 28 },
    ],
  },
  May: {
    spend: 40,
    revenue: 50,
    tax: 10,
    weekly: [50, 35, 65, 80, 45, 70, 55],
    categories: [
      { name: "Food", amount: 3900, percent: 75 },
      { name: "Shopping", amount: 2300, percent: 50 },
      { name: "Transport", amount: 1300, percent: 32 },
    ],
  },
  June: {
    spend: 30,
    revenue: 60,
    tax: 10,
    weekly: [40, 60, 35, 70, 50, 80, 45],
    categories: [
      { name: "Food", amount: 2700, percent: 55 },
      { name: "Shopping", amount: 1700, percent: 38 },
      { name: "Transport", amount: 800, percent: 20 },
    ],
  },
  July: {
    spend: 37,
    revenue: 53,
    tax: 10,
    weekly: [45, 65, 35, 80, 55, 70, 50],
    categories: [
      { name: "Food", amount: 3300, percent: 68 },
      { name: "Shopping", amount: 2100, percent: 46 },
      { name: "Transport", amount: 1000, percent: 25 },
    ],
  },
  August: {
    spend: 25,
    revenue: 64,
    tax: 11,
    weekly: [35, 55, 40, 75, 45, 65, 50],
    categories: [
      { name: "Food", amount: 2500, percent: 55 },
      { name: "Shopping", amount: 1800, percent: 40 },
      { name: "Transport", amount: 950, percent: 24 },
    ],
  },
  September: {
    spend: 36,
    revenue: 54,
    tax: 10,
    weekly: [50, 40, 70, 55, 80, 45, 60],
    categories: [
      { name: "Food", amount: 3400, percent: 68 },
      { name: "Shopping", amount: 2100, percent: 46 },
      { name: "Transport", amount: 1200, percent: 30 },
    ],
  },
  October: {
    spend: 33,
    revenue: 57,
    tax: 10,
    weekly: [40, 60, 45, 75, 55, 80, 50],
    categories: [
      { name: "Food", amount: 3100, percent: 62 },
      { name: "Shopping", amount: 1900, percent: 42 },
      { name: "Transport", amount: 1000, percent: 25 },
    ],
  },
  November: {
    spend: 39,
    revenue: 51,
    tax: 10,
    weekly: [55, 35, 75, 45, 65, 80, 50],
    categories: [
      { name: "Food", amount: 3700, percent: 72 },
      { name: "Shopping", amount: 2400, percent: 52 },
      { name: "Transport", amount: 1300, percent: 32 },
    ],
  },
  December: {
    spend: 45,
    revenue: 45,
    tax: 10,
    weekly: [60, 45, 80, 55, 90, 70, 65],
    categories: [
      { name: "Food", amount: 4500, percent: 85 },
      { name: "Shopping", amount: 3200, percent: 68 },
      { name: "Transport", amount: 1600, percent: 38 },
    ],
  },
};

const months = Object.keys(monthlyData);

export default function Overview() {
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [showInsight, setShowInsight] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const data = monthlyData[selectedMonth];

  function handleCreateGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!goalName.trim() || !goalAmount || Number(goalAmount) <= 0) {
      return;
    }

    alert(
      `Goal: ${goalName}\nTarget: Rs. ${Number(goalAmount).toLocaleString()}`
    );

    setGoalName("");
    setGoalAmount("");
    setShowGoalForm(false);
  }

  return (
    <main className="min-h-screen bg-sky-300 px-4 py-6 text-black sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.2em] text-gray-700">
              NOVA FINANCE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Overview
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Your money, in perspective.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <FaWallet size={19} />
          </div>
        </header>

        {/* Balance and Month */}
        <section className="mt-7 rounded-3xl bg-black p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm tracking-widest text-gray-400">
                TOTAL BALANCE
              </p>
              <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Rs. 17,339
                <span className="text-gray-500">.03</span>
              </h2>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-400 px-3 py-1.5 text-sm font-semibold text-black">
                <FaArrowUp />
                8.4%
                <span className="font-normal">this month</span>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black">
              <span>{selectedMonth}</span>
              <TiArrowSortedDown size={20} />
              <select
                aria-label="Select month"
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setShowInsight(false);
                }}
                className="max-w-24 cursor-pointer bg-transparent outline-none"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/10 p-3 sm:p-4">
              <p className="text-xs text-gray-300 sm:text-sm">Spend</p>
              <p className="mt-2 text-2xl font-semibold">{data.spend}%</p>
              <p className="mt-1 text-xs text-gray-400">of income</p>
            </div>

            <div className="rounded-2xl bg-sky-300 p-3 text-black sm:p-4">
              <p className="text-xs text-gray-700 sm:text-sm">Revenue</p>
              <p className="mt-2 text-2xl font-semibold">{data.revenue}%</p>
              <p className="mt-1 text-xs text-gray-700">of income</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 sm:p-4">
              <p className="text-xs text-gray-300 sm:text-sm">Tax</p>
              <p className="mt-2 text-2xl font-semibold">{data.tax}%</p>
              <p className="mt-1 text-xs text-gray-400">of income</p>
            </div>
          </div>
        </section>

        {/* Weekly Spending Chart */}
        <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Spending Activity
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Weekly overview for {selectedMonth}
              </p>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-2 text-xs font-medium">
              This month
            </span>
          </div>

          <div className="mt-6 flex h-44 items-end justify-between gap-2 sm:h-52 sm:gap-4">
            {data.weekly.map((height, index) => (
              <div
                key={`${selectedMonth}-${index}`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className={`w-full max-w-10 rounded-t-xl transition-all duration-300 ${
                      index === 3 ? "bg-black" : "bg-sky-300"
                    }`}
                    style={{ height: `${height}%` }}
                    title={`Day ${index + 1}: ${height}%`}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Illustrative chart values, not actual transaction records.
          </p>
        </section>

        {/* Spending Categories */}
        <section className="mt-6 rounded-3xl bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Spending Categories
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Where your money goes
              </p>
            </div>
            <FaWallet className="text-xl text-gray-400" />
          </div>

          <div className="mt-5 space-y-5">
            {data.categories.map((category, index) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                      {index === 0 && <FaUtensils />}
                      {index === 1 && <FaShoppingBag />}
                      {index === 2 && <FaBus />}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    Rs. {category.amount.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-300"
                    style={{ width: `${category.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-gray-400">
            Sample amounts for layout demonstration.
          </p>
        </section>

        {/* Bottom Action Cards */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-sky-200 p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <FaArrowDown className="rotate-45" />
            </div>
            <h3 className="mt-4 text-xl font-bold">Understand your spending</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Review your spending patterns and discover opportunities to save.
            </p>

            <button
              type="button"
              onClick={() => setShowInsight((previous) => !previous)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              {showInsight ? "Hide Insight" : "View Insight"}
              <FaArrowRight />
            </button>

            {showInsight && (
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="font-semibold">
                  Your {selectedMonth} snapshot
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Your sample spending ratio is {data.spend}% of income.
                  Review your Food and Shopping expenses to find possible
                  savings. Real comparisons require actual transaction data.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-black p-5 text-white sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-300 text-black">
              <MdSavings size={25} />
            </div>
            <h3 className="mt-4 text-xl font-bold">
              Create your goal
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Set a savings target and take a step toward your future.
            </p>

            <button
              type="button"
              onClick={() => setShowGoalForm((previous) => !previous)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-sky-200"
            >
              {showGoalForm ? "Close" : "Add a new goal"}
              <FaArrowRight />
            </button>

            {showGoalForm && (
              <form
                onSubmit={handleCreateGoal}
                className="mt-4 space-y-3 rounded-2xl bg-white p-4 text-black"
              >
                <label className="block text-sm font-medium">
                  Goal name
                  <input
                    value={goalName}
                    onChange={(event) => setGoalName(event.target.value)}
                    placeholder="e.g. New laptop"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-sky-400"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Target amount (Rs.)
                  <input
                    type="number"
                    min="1"
                    value={goalAmount}
                    onChange={(event) => setGoalAmount(event.target.value)}
                    placeholder="50000"
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-sky-400"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-black px-4 py-3 text-sm font-semibold text-white"
                >
                  Create Goal
                </button>
              </form>
            )}
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-gray-600">
          NOVA Finance · Your money, in perspective.
        </footer>
      </div>
    </main>
  );
}