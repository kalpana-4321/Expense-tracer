import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getDashboardData, getChatHistory, saveChatMessage } from "@/lib/db";
import { formatNpr } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Strip markdown formatting symbols from AI-generated text. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    .replace(/\*([^*]+)\*/g, "$1") // *italic*
    .replace(/^#{1,6}\s+/gm, "") // ## headings
    .replace(/^[*\-]\s+/gm, "• ") // bullet points → •
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1") // inline/block code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [link](url)
    .trim();
}

export async function GET() {
  try {
    const history = await getChatHistory();
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: "Unable to load chat history." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing.");

      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from .env.local" },
        { status: 500 }
      );
    }

    let financeContext = "";
    try {
      const dashboard = await getDashboardData();
      const topTx = dashboard.transactions
        .slice(0, 6)
        .map(
          (t) =>
            `${t.title} (${t.category}, ${t.direction}, ${formatNpr(t.amountPaisa).formatted}, ${t.status})`
        )
        .join("; ");
      const goalsText = dashboard.goals
        .map(
          (g) =>
            `${g.name}: ${formatNpr(g.savedPaisa).formatted} / ${formatNpr(g.targetPaisa).formatted}`
        )
        .join("; ");

      financeContext = `
User wallet context (NPR / Khalti):
- Available balance: ${formatNpr(dashboard.wallet.balancePaisa).formatted}
- Month spend: ${formatNpr(dashboard.stats.monthSpendPaisa).formatted}
- Month income: ${formatNpr(dashboard.stats.monthIncomePaisa).formatted}
- Pending requests: ${dashboard.stats.pendingRequestsCount}
- Recent transactions: ${topTx}
- Savings goals: ${goalsText}
Keep answers concise, practical, and grounded in these real NPR figures when relevant. Reply in plain text only — no markdown formatting, no asterisks, no bullet symbols, no headers.`;
    } catch {
      // Proceed even if context fetch fails
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `${financeContext}\n\nUser question: ${message.trim()}`,
    });

    const rawReply = result.text ?? "No response received.";
    const cleanReply = stripMarkdown(rawReply);

    // Persist both sides of the conversation
    try {
      await Promise.all([
        saveChatMessage("user", message.trim()),
        saveChatMessage("ai", cleanReply),
      ]);
    } catch (saveErr) {
      console.error("Failed to save chat message to DB:", saveErr);
      // Non-fatal: still return reply to user
    }

    return NextResponse.json({ reply: cleanReply });
  } catch (error) {
    console.error("Gemini API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "AI response could not be generated.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
