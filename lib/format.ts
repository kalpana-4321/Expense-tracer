export function formatNpr(paisa: number): {
  whole: string;
  decimals: string;
  formatted: string;
} {
  const absNpr = Math.abs(paisa) / 100;
  const fixed = absNpr.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const formattedInt = Number(intPart).toLocaleString("en-IN");
  return {
    whole: formattedInt,
    decimals: decPart,
    formatted: `Rs. ${formattedInt}.${decPart}`,
  };
}

export function formatNprCompact(paisa: number): string {
  const npr = Math.round(paisa / 100);
  return `Rs. ${npr.toLocaleString("en-IN")}`;
}

export function formatSignedNpr(
  paisa: number,
  direction: "debit" | "credit" | "request"
): string {
  const { formatted } = formatNpr(paisa);
  if (direction === "credit") return `+ ${formatted}`;
  if (direction === "debit") return `- ${formatted}`;
  return formatted;
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Today · ${timeStr}`;
  if (diffDays === 1) return `Yesterday · ${timeStr}`;
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${dateStr} · ${timeStr}`;
}
