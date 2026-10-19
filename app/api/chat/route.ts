
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

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

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: message,
    });

    return NextResponse.json({
      reply: result.text ?? "No response received.",
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      { error: "AI response aauna sakena. Please check the server terminal." },
      { status: 500 }
    );
  }
}
