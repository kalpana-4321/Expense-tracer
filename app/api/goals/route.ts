import { NextResponse } from "next/server";
import {
  contributeGoalRecord,
  createGoalRecord,
  deleteGoalRecord,
  listGoals,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listGoals();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Goals GET error:", error);
    return NextResponse.json(
      { error: "Unable to load savings goals." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      targetNpr?: number;
      savedNpr?: number;
      targetDate?: string;
    };

    const name = body.name?.trim() ?? "";
    const targetNpr = Number(body.targetNpr ?? 0);
    const savedNpr = Number(body.savedNpr ?? 0);
    const targetDate = body.targetDate?.trim() ?? "";

    if (!name || !Number.isFinite(targetNpr) || targetNpr <= 0) {
      return NextResponse.json(
        { error: "Enter a goal name and a target amount above Rs. 0." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(savedNpr) || savedNpr < 0 || savedNpr > targetNpr) {
      return NextResponse.json(
        { error: "Saved amount must be between Rs. 0 and the target amount." },
        { status: 400 }
      );
    }

    if (!targetDate) {
      return NextResponse.json(
        { error: "Choose a target date." },
        { status: 400 }
      );
    }

    const goal = await createGoalRecord({
      name,
      targetPaisa: Math.round(targetNpr * 100),
      savedPaisa: Math.round(savedNpr * 100),
      targetDate,
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Goals POST error:", error);
    return NextResponse.json(
      { error: "Unable to create goal." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: number;
      amountNpr?: number;
    };

    const id = Number(body.id);
    const amountNpr = Number(body.amountNpr);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid goal ID." }, { status: 400 });
    }
    if (!Number.isFinite(amountNpr) || amountNpr <= 0) {
      return NextResponse.json(
        { error: "Enter a contribution amount above Rs. 0." },
        { status: 400 }
      );
    }

    const goal = await contributeGoalRecord({
      id,
      amountPaisa: Math.round(amountNpr * 100),
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Insufficient balance"
    ) {
      return NextResponse.json(
        {
          error:
            "Insufficient balance. Please add funds to your wallet first.",
        },
        { status: 400 }
      );
    }
    console.error("Goals PATCH error:", error);
    return NextResponse.json(
      { error: "Unable to update goal." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid goal ID." }, { status: 400 });
    }

    const deleted = await deleteGoalRecord(id);
    if (!deleted) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Goals DELETE error:", error);
    return NextResponse.json(
      { error: "Unable to delete goal." },
      { status: 500 }
    );
  }
}
