"use client";

import { useState } from "react";
import {
  MdSavings,
  MdAddHome,
  MdArrowForward,
} from "react-icons/md";
import { AiFillFileText } from "react-icons/ai";
import {
  GoArrowUpRight,
  GoArrowDownLeft,
  GoGoal,
} from "react-icons/go";
import { FaSpotify, FaPinterest } from "react-icons/fa";
import { LiaUber } from "react-icons/lia";
import { CiYoutube, CiSearch } from "react-icons/ci";
import { GrOverview } from "react-icons/gr";
import { RiAiAgentLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

const activities = [
  {
    name: "Spotify",
    time: "Today · 12:18 PM",
    amount: "- Rs. 120",
    category: "Subscription",
    icon: FaSpotify,
    iconColor: "text-black",
    iconBg: "bg-green-400",
    outerBg: "bg-green-100",
  },
  {
    name: "Uber",
    time: "Today · 12:30 PM",
    amount: "- Rs. 250",
    category: "Transport",
    icon: LiaUber,
    iconColor: "text-black",
    iconBg: "bg-white",
    outerBg: "bg-gray-200",
  },
  {
    name: "Pinterest",
    time: "Yesterday · 1:15 PM",
    amount: "- Rs. 400",
    category: "Subscription",
    icon: FaPinterest,
    iconColor: "text-red-500",
    iconBg: "bg-white",
    outerBg: "bg-red-100",
  },
  {
    name: "YouTube",
    time: "Yesterday · 1:30 PM",
    amount: "- Rs. 399",
    category: "Subscription",
    icon: CiYoutube,
    iconColor: "text-red-500",
    iconBg: "bg-white",
    outerBg: "bg-red-100",
  },
];

export default function About() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const filteredActivities = activities.filter((activity) =>
    `${activity.name} ${activity.category}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  function handleSearch() {
    setSearchOpen((previous) => !previous);
    setSearchText("");
  }

  return (
    <main className="min-h-screen bg-sky-300 text-black">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8 sm:py-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-gray-600">
              NOVA FINANCE
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              My Dashboard
            </h1>
          </div>

          <img
            src="/kaladevi1.png"
            alt="Profile"
            className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md sm:h-14 sm:w-14"
          />
        </header>

        {/* Total Balance */}
        <section className="mt-7 rounded-3xl bg-black p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm tracking-wide text-gray-400">
                TOTAL BALANCE
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Rs. 17,339.
                <span className="text-gray-400">03</span>
              </h2>
              <p className="mt-3 text-sm text-gray-400">
                Your money, in perspective.
              </p>
            </div>

            <div className="rounded-2xl bg-sky-300 p-3 text-black">
              <MdSavings size={28} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-full bg-sky-300 px-5 py-3 font-semibold text-black transition hover:bg-sky-200">
              Send
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white">
                <GoArrowUpRight size={18} />
              </span>
            </button>

            <button className="flex items-center gap-2 rounded-full border border-white/25 px-4 py-3 font-semibold text-white transition hover:bg-white/10">
              Request
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                <GoArrowDownLeft size={18} />
              </span>
            </button>
          </div>
        </section>

        {/* Saving and Bill cards */}
        <section className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/80 p-4 shadow-sm sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-200">
              <MdSavings className="text-2xl" />
            </div>

            <p className="mt-4 text-sm text-gray-500">Saving</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">
              Rs. 3,251.
              <span className="text-gray-500">03</span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-100">
              <div className="h-full w-2/3 rounded-full bg-sky-500" />
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-4 shadow-sm sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-200">
              <AiFillFileText className="text-2xl" />
            </div>

            <p className="mt-4 text-sm text-gray-500">Bills</p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">
              Rs. 3,251.
              <span className="text-gray-500">03</span>
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-100">
              <div className="h-full w-1/2 rounded-full bg-black" />
            </div>
          </div>
        </section>

        {/* Search */}
        {searchOpen && (
          <section className="mt-6">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <CiSearch className="shrink-0 text-2xl text-gray-500" />
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search Spotify, Uber..."
                autoFocus
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section className="mt-7 rounded-t-[2.5rem] bg-black px-4 pb-28 pt-7 text-white sm:px-7 sm:pt-9">
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-600" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-sky-300">
                YOUR TRANSACTIONS
              </p>
              <h2 className="mt-2 text-2xl font-bold">Recent Activity</h2>
            </div>

            <button
              onClick={() => router.push("/overview")}
              className="flex items-center gap-1 text-sm text-sky-300"
            >
              Overview
              <MdArrowForward />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.name}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 sm:gap-4 sm:p-4"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${activity.outerBg}`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${activity.iconBg}`}
                      >
                        <Icon className={`text-xl ${activity.iconColor}`} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{activity.name}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {activity.time}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {activity.amount}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {activity.category}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl bg-white/10 p-6 text-center text-sm text-gray-300">
                No matching transactions found.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-black/85 p-2 text-white shadow-xl backdrop-blur-xl">
        <div className="grid flex-1 grid-cols-4">
          <button
            onClick={() => router.push("/about")}
            className="flex flex-col items-center gap-1 rounded-full py-2 text-sky-300"
          >
            <MdAddHome size={22} />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => router.push("/overview")}
            className="flex flex-col items-center gap-1 rounded-full py-2 transition hover:text-sky-300"
          >
            <GrOverview size={20} />
            <span className="text-[10px]">Overview</span>
          </button>

          <button
            onClick={() => router.push("/goal")}
            className="flex flex-col items-center gap-1 rounded-full py-2 transition hover:text-sky-300"
          >
            <GoGoal size={22} />
            <span className="text-[10px]">Goals</span>
          </button>

          <button
            onClick={() => router.push("/agent")}
            className="flex flex-col items-center gap-1 rounded-full py-2 transition hover:text-sky-300"
          >
            <RiAiAgentLine size={22} />
            <span className="text-[10px]">Agent</span>
          </button>
        </div>

        <button
          onClick={handleSearch}
          aria-label="Search transactions"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
            searchOpen
              ? "bg-sky-300 text-black"
              : "bg-white/15 text-white hover:bg-white/25"
          }`}
        >
          <CiSearch size={25} />
        </button>
      </nav>
    </main>
  );
}