import Link from "next/link";
import { GoArrowDownLeft, GoArrowUpRight } from "react-icons/go";
import { MdArrowForward } from "react-icons/md";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#0f172a]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-5 py-8 sm:px-8 sm:py-12">
        <header className="flex items-center justify-between">
          <Logo href="/" size="md" />

          <Link
            href="/about"
            className="rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-medium text-[#0f172a] transition hover:bg-[#eaf0f6]"
          >
            Open Wallet
          </Link>
        </header>

        <section className="my-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="text-4xl font-bold leading-[1.06] tracking-[-0.03em] sm:text-6xl">
              Your money, in perspective.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#475569] sm:text-lg">
              Track daily NPR expenses, manage savings targets, and send or
              request payments through Khalti from one ledger.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/about"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0b0f17] px-6 text-sm font-semibold text-white transition hover:bg-[#1e293b]"
              >
                Enter Wallet
                <MdArrowForward size={18} />
              </Link>

              <Link
                href="/overview"
                className="inline-flex h-12 items-center rounded-xl border border-[#cbd5e1] bg-white px-5 text-sm font-medium text-[#0f172a] transition hover:bg-[#eaf0f6]"
              >
                View Analytics
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div
              data-ui="wallet-preview"
              className="rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#94a3b8]">Available balance</span>
                <span className="rounded-full bg-[#131f30] px-2.5 py-1 text-xs font-medium text-[#38bdf8]">
                  Khalti Linked
                </span>
              </div>

              <p className="num mt-3 text-3xl font-bold tracking-tight">
                Rs. 17,339<span className="text-[#64748b]">.03</span>
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-[#38bdf8] px-3 py-2.5 text-sm font-semibold text-[#0b0f17]">
                  <GoArrowUpRight size={16} />
                  Send
                </div>
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#131a26] px-3 py-2.5 text-sm font-medium text-white">
                  <GoArrowDownLeft size={16} />
                  Request
                </div>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-[#1e293b] pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#cbd5e1]">WorldLink Fiber</span>
                  <span className="num font-medium text-white">- Rs. 1,450.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#cbd5e1]">Freelance Retainer</span>
                  <span className="num font-medium text-[#4ade80]">
                    + Rs. 24,500.00
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#cbd5e1]">Pathao Ride</span>
                  <span className="num font-medium text-white">- Rs. 250.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[13px] text-[#475569]">
          <span>NOVA Finance · Kathmandu, Nepal</span>
          <span>Neon Postgres · Khalti ePayment v2 · Gemini Assistant</span>
        </footer>
      </div>
    </main>
  );
}
