"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { RiBarChartBoxLine, RiRobot2Line } from "react-icons/ri";
import { GoGoal } from "react-icons/go";

const NAV_ITEMS = [
  {
    href: "/about",
    label: "Wallet",
    icon: MdOutlineAccountBalanceWallet,
  },
  {
    href: "/overview",
    label: "Overview",
    icon: RiBarChartBoxLine,
  },
  {
    href: "/goal",
    label: "Goals",
    icon: GoGoal,
  },
  {
    href: "/agent",
    label: "Assistant",
    icon: RiRobot2Line,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <nav
        aria-label="Primary navigation"
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#0b0f17] p-1.5 text-white shadow-[0_12px_32px_rgba(11,15,23,0.22)]"
      >
        <ul className="grid grid-cols-4 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/about" && pathname?.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors duration-150 ${
                    active
                      ? "bg-[#131f30] text-[#38bdf8]"
                      : "text-[#94a3b8] hover:bg-[#131a26] hover:text-white"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0 h-0.5 w-7 rounded-full bg-[#38bdf8]"
                    />
                  )}
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
