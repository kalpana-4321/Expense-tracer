
"use client";

import { useState } from "react";
import { FaArrowUp } from "react-icons/fa";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function Agent() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    const trimmedMessage = message.trim();

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const result = await response.text();

      let data: { reply?: string; error?: string };

      try {
        data = JSON.parse(result);
      } catch {
        throw new Error(
          "Server returned HTML instead of JSON. Check the API route and terminal."
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
      console.error("Chat error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-sky-300 text-black">
      {/* Header */}
      <header className="px-5 pt-5">
        <h1 className="text-2xl font-bold">NOVA AI</h1>
        <p className="mt-1 text-sm text-gray-600">
          Your personal finance assistant
        </p>
      </header>

      {/* Chat area */}
      <section className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <div className="mt-20 text-center">
            <h2 className="text-xl font-semibold">
              Welcome to NOVA!
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Ask me about saving, budgeting, or managing money.
            </p>
          </div>
        )}

        {messages.map((item, index) => (
          <div
            key={index}
            className={`w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-2xl p-3 ${
              item.role === "user"
                ? "ml-auto bg-black text-white"
                : "mr-auto bg-white text-black"
            }`}
          >
            {item.text}
          </div>
        ))}

        {loading && (
          <p className="mr-auto w-fit rounded-2xl bg-white p-3 text-sm text-gray-600">
            NOVA is thinking...
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {/* Message input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
        className="sticky bottom-0 flex items-center gap-3 bg-sky-300 px-5 pb-6 pt-3"
      >
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask NOVA anything..."
          disabled={loading}
          className="min-w-0 flex-1 rounded-full bg-white px-5 py-4 text-black outline-none placeholder:text-gray-500"
        />

        <button
          type="submit"
          aria-label="Send message"
          disabled={loading || !message.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaArrowUp className="text-lg" />
        </button>
      </form>
    </main>
  );
}
