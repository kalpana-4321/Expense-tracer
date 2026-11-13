import { NextResponse } from "next/server";
import { clearChatHistory } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearChatHistory();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Chat clear error:", error);
    return NextResponse.json(
      { error: "Unable to clear chat history." },
      { status: 500 }
    );
  }
}
