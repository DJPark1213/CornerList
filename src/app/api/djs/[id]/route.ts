import { NextRequest, NextResponse } from "next/server";
import { getDjById } from "@/lib/data/djs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dj = await getDjById(id);
    if (!dj) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ dj });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load DJ" },
      { status: 500 }
    );
  }
}
