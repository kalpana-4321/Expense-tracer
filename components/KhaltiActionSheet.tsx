"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import { MdClose, MdContentCopy, MdCheck } from "react-icons/md";
import { formatNpr } from "@/lib/format";
import type { Transaction } from "@/lib/types";

interface KhaltiActionSheetProps {
  open: boolean;
  initialMode: "send" | "request";
  balancePaisa: number;
  khaltiMode: "live" | "sandbox";
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

const CATEGORIES = ["Transfer", "Food", "Bills", "Transport", "Shopping", "Split Bill"];
const PRESET_AMOUNTS = [100, 500, 1000, 2500];

export function KhaltiActionSheet({
  open,
  initialMode,
  balancePaisa,
  khaltiMode,
  onClose,
  onSuccess,
}: KhaltiActionSheetProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"send" | "request">(initialMode);
  const [counterpartyName, setCounterpartyName] = useState("");
  const [counterpartyPhone, setCounterpartyPhone] = useState("");
  const [amountNpr, setAmountNpr] = useState("");
  const [category, setCategory] = useState(
    initialMode === "request" ? "Split Bill" : "Transfer"
  );
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdRequest, setCreatedRequest] = useState<{
    pidx: string;
    paymentUrl: string;
    transaction: Transaction;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  function switchMode(next: "send" | "request") {
    setMode(next);
    setError("");
    setCreatedRequest(null);
    setCategory(next === "request" ? "Split Bill" : "Transfer");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedAmount = Number(amountNpr);
    if (!counterpartyName.trim()) {
      setError(
        mode === "send"
          ? "Enter the recipient's name."
          : "Enter who you are requesting from."
      );
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount < 10) {
      setError("Khalti payments require at least Rs. 10.");
      return;
    }
    if (mode === "send" && Math.round(parsedAmount * 100) > balancePaisa) {
      setError("Amount exceeds your available wallet balance.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          amountNpr: parsedAmount,
          counterpartyName: counterpartyName.trim(),
          counterpartyPhone: counterpartyPhone.trim(),
          category,
          note: note.trim(),
        }),
      });

      const data = (await res.json()) as {
        pidx?: string;
        paymentUrl?: string;
        transaction?: Transaction;
        error?: string;
      };

      if (!res.ok || !data.paymentUrl || !data.transaction || !data.pidx) {
        throw new Error(data.error || "Unable to start Khalti payment.");
      }

      onSuccess(data.transaction);

      if (mode === "send") {
        onClose();
        if (data.paymentUrl.startsWith("/")) {
          router.push(data.paymentUrl);
        } else {
          window.location.href = data.paymentUrl;
        }
        return;
      }

      setCreatedRequest({
        pidx: data.pidx,
        paymentUrl: data.paymentUrl,
        transaction: data.transaction,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not connect to Khalti."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (!createdRequest) return;
    const fullUrl = createdRequest.paymentUrl.startsWith("http")
      ? createdRequest.paymentUrl
      : `${window.location.origin}${createdRequest.paymentUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed. Select and copy the link manually.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b0f17]/55 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="khalti-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-[#dfe7f0] bg-white p-6 text-[#0f172a] shadow-[0_24px_48px_rgba(11,15,23,0.2)] sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="khalti-sheet-title" className="text-lg font-semibold">
              {mode === "send" ? "Send with Khalti" : "Request via Khalti"}
            </h2>
            <p className="mt-0.5 text-sm text-[#475569]">
              {khaltiMode === "live"
                ? "Connected to Khalti ePayment v2 gateway"
                : "Khalti KPG-2 sandbox checkout ready"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Khalti dialog"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfe7f0] text-[#475569] transition hover:bg-[#eaf0f6] hover:text-[#0f172a]"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div
          className="mt-4 grid grid-cols-2 rounded-xl bg-[#eaf0f6] p-1"
          role="tablist"
          aria-label="Khalti action mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "send"}
            onClick={() => switchMode("send")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
              mode === "send"
                ? "bg-white text-[#0f172a] shadow-xs"
                : "text-[#475569] hover:text-[#0f172a]"
            }`}
          >
            <GoArrowUpRight size={16} />
            Send
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "request"}
            onClick={() => switchMode("request")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
              mode === "request"
                ? "bg-white text-[#0f172a] shadow-xs"
                : "text-[#475569] hover:text-[#0f172a]"
            }`}
          >
            <GoArrowDownLeft size={16} />
            Request
          </button>
        </div>

        {createdRequest ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] p-4">
              <p className="text-sm font-semibold text-[#0c4a6e]">
                Khalti Payment Request Created
              </p>
              <p className="num mt-1 text-2xl font-bold text-[#0f172a]">
                {formatNpr(createdRequest.transaction.amountPaisa).formatted}
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                From {createdRequest.transaction.counterparty}
              </p>
              <p className="mt-2 font-mono text-xs text-[#0369a1]">
                PIDX: {createdRequest.pidx}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] transition hover:bg-[#eaf0f6]"
              >
                {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
                {copied ? "Link copied" : "Copy payment link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (createdRequest.paymentUrl.startsWith("/")) {
                    router.push(createdRequest.paymentUrl);
                  } else {
                    window.location.href = createdRequest.paymentUrl;
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b0f17] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
              >
                Open Khalti Pay
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="khalti-counterparty"
                className="block text-sm font-medium text-[#0f172a]"
              >
                {mode === "send" ? "Recipient or merchant" : "Request from"}
              </label>
              <input
                id="khalti-counterparty"
                type="text"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                placeholder={
                  mode === "send" ? "e.g. WorldLink or Sita Rai" : "e.g. Rohan Karki"
                }
                required
                className="mt-1.5 h-10 w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 text-sm outline-none focus:border-[#0284c7]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="khalti-phone"
                  className="block text-sm font-medium text-[#0f172a]"
                >
                  Khalti mobile (optional)
                </label>
                <input
                  id="khalti-phone"
                  type="tel"
                  inputMode="numeric"
                  value={counterpartyPhone}
                  onChange={(e) => setCounterpartyPhone(e.target.value)}
                  placeholder="9800000000"
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 text-sm outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label
                  htmlFor="khalti-category"
                  className="block text-sm font-medium text-[#0f172a]"
                >
                  Category
                </label>
                <select
                  id="khalti-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-[#cbd5e1] bg-white px-3 text-sm outline-none focus:border-[#0284c7]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="khalti-amount"
                  className="block text-sm font-medium text-[#0f172a]"
                >
                  Amount (Rs.)
                </label>
                <span className="num text-xs text-[#64748b]">
                  Available: {formatNpr(balancePaisa).formatted}
                </span>
              </div>
              <input
                id="khalti-amount"
                type="number"
                min="10"
                step="0.01"
                value={amountNpr}
                onChange={(e) => setAmountNpr(e.target.value)}
                placeholder="500"
                required
                className="num mt-1.5 h-11 w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 text-base font-semibold outline-none focus:border-[#0284c7]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountNpr(String(preset))}
                    className="num rounded-lg border border-[#dfe7f0] bg-[#f4f7fb] px-2.5 py-1 text-xs font-medium text-[#334155] transition hover:border-[#38bdf8] hover:bg-[#e0f2fe]"
                  >
                    Rs. {preset.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="khalti-note"
                className="block text-sm font-medium text-[#0f172a]"
              >
                Note (optional)
              </label>
              <input
                id="khalti-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What is this payment for?"
                className="mt-1.5 h-10 w-full rounded-xl border border-[#cbd5e1] bg-white px-3.5 text-sm outline-none focus:border-[#0284c7]"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#fecaca] bg-[#fee2e2] px-3.5 py-2.5 text-sm text-[#7f1d1d]"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b0f17] px-4 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Connecting to Khalti..."
                : mode === "send"
                  ? "Continue to Khalti Checkout"
                  : "Generate Khalti Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
