import { NextRequest, NextResponse } from "next/server";
import { listReviewsForDj } from "@/lib/data/djs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reviews = await listReviewsForDj(id);
    return NextResponse.json({ reviews });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}
