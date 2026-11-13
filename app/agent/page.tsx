"use client";

import { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaTrash } from "react-icons/fa";
import { RiRobot2Line } from "react-icons/ri";
import { BottomNav } from "@/components/BottomNav";
import { SkeletonBar } from "@/components/Skeleton";
import { formatNpr } from "@/lib/format";
import type { DashboardResponse } from "@/lib/types";

type Message = {
  role: "user" | "ai";
  text: string;
};

const QUICK_PROMPTS = [
  "Where did most of my spending go this month?",
  "How should I prioritize my active savings goals?",
  "Summarize my pending Khalti payment requests",
  "How can I cut recurring subscription bills?",
];

export default function Agent() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contextData, setContextData] = useState<DashboardResponse | null>(
    null
  );
  const [contextLoading, setContextLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load dashboard context
  useEffect(() => {
    let active = true;
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as DashboardResponse;
        if (active) setContextData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setContextLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Load persisted chat history on mount
  useEffect(() => {
    let active = true;
    fetch("/api/chat", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as {
          history?: { role: "user" | "ai"; content: string }[];
        };
        if (active && json.history) {
          setMessages(
            json.history.map((m) => ({ role: m.role, text: m.content }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setHistoryLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendPrompt(rawText: string) {
    const trimmedMessage = rawText.trim();
    if (!trimmedMessage || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text: trimmedMessage },
    ]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const result = await response.text();
      let data: { reply?: string; error?: string } = {};

      try {
        data = JSON.parse(result);
      } catch {
        throw new Error(
          `Server returned status ${response.status} (${response.statusText || "Error"}). Please try again.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get an AI response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "ai",
          text: data.reply || "No response received.",
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    try {
      await fetch("/api/chat/clear", { method: "POST" });
      setMessages([]);
    } catch {
      // silent — local state cleared anyway
      setMessages([]);
    }
  }

  const showWelcome = !historyLoading && messages.length === 0;

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-28 text-[#0f172a]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex items-center justify-between border-b border-[#dfe7f0] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b0f17] text-[#38bdf8]">
              <RiRobot2Line size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                NOVA Assistant
              </h1>
              <p className="text-[13px] text-[#475569]">
                Grounded in your current wallet balance, Khalti ledger, and goals
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => void clearHistory()}
              title="Clear chat history"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#dfe7f0] bg-white px-3 text-[13px] text-[#64748b] hover:border-[#fca5a5] hover:text-[#b91c1c]"
            >
              <FaTrash size={12} />
              Clear
            </button>
          )}
        </header>

        <section className="mt-5 space-y-4">
          {historyLoading && (
            <div className="space-y-3">
              <SkeletonBar className="h-10 w-3/4 rounded-2xl" />
              <SkeletonBar className="ml-auto h-10 w-1/2 rounded-2xl" />
              <SkeletonBar className="h-10 w-2/3 rounded-2xl" />
            </div>
          )}

          {showWelcome && (
            <>
              <div className="grid grid-cols-1 divide-y divide-[#dfe7f0] rounded-2xl border border-[#dfe7f0] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="p-4">
                  <p className="text-[13px] font-medium text-[#475569]">
                    Wallet Balance
                  </p>
                  {contextLoading || !contextData ? (
                    <SkeletonBar className="mt-2 h-6 w-28" />
                  ) : (
                    <p className="num mt-1 text-lg font-bold text-[#0f172a]">
                      {formatNpr(contextData.wallet.balancePaisa).formatted}
                    </p>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[13px] font-medium text-[#475569]">
                    Month Outgoings
                  </p>
                  {contextLoading || !contextData ? (
                    <SkeletonBar className="mt-2 h-6 w-28" />
                  ) : (
                    <p className="num mt-1 text-lg font-bold text-[#0f172a]">
                      {formatNpr(contextData.stats.monthSpendPaisa).formatted}
                    </p>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[13px] font-medium text-[#475569]">
                    Pending Khalti
                  </p>
                  {contextLoading || !contextData ? (
                    <SkeletonBar className="mt-2 h-6 w-24" />
                  ) : (
                    <p className="num mt-1 text-lg font-bold text-[#0369a1]">
                      {contextData.stats.pendingRequestsCount} request
                      {contextData.stats.pendingRequestsCount === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#dfe7f0] bg-white p-6">
                <h2 className="text-base font-semibold">
                  Ask about your finances
                </h2>
                <p className="mt-1 text-sm text-[#475569]">
                  Pick a starting question or write your own below. Your live
                  ledger and goals are included automatically.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendPrompt(prompt)}
                      className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-3 text-left text-[13px] font-medium text-[#0f172a] transition-colors hover:border-[#38bdf8] hover:bg-[#e0f2fe]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {messages.map((item, index) => (
            <div
              key={index}
              className={`w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                item.role === "user"
                  ? "ml-auto bg-[#0b0f17] text-white"
                  : "mr-auto border border-[#dfe7f0] bg-white text-[#0f172a]"
              }`}
            >
              {item.text}
            </div>
          ))}

          {loading && (
            <div className="mr-auto w-fit max-w-xs space-y-2 rounded-2xl border border-[#dfe7f0] bg-white p-4">
              <div className="h-3.5 w-44 rounded bg-[#e5ecf4]" />
              <div className="h-3.5 w-32 rounded bg-[#e5ecf4]" />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-[#fecaca] bg-[#fee2e2] p-3.5 text-sm text-[#7f1d1d]"
            >
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </section>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendPrompt(message);
          }}
          className="mt-5 flex items-center gap-2.5 rounded-2xl border border-[#dfe7f0] bg-white p-2"
        >
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask NOVA about spending, Khalti, or goals..."
            disabled={loading}
            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-[#0f172a] outline-none placeholder:text-[#475569]"
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={loading || !message.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b0f17] text-white transition-colors hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaArrowUp size={15} />
          </button>
        </form>
      </div>

      <BottomNav />
    </main>
  );
}
