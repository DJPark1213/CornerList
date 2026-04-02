import { NextRequest, NextResponse } from "next/server";
import { listDjs } from "@/lib/data/djs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const genre = searchParams.get("genre");
    const location = searchParams.get("location");
    const maxPriceRaw = searchParams.get("maxPrice");
    const limitRaw = searchParams.get("limit");
    const offsetRaw = searchParams.get("offset");

    const maxPriceParsed = maxPriceRaw ? Number(maxPriceRaw) : null;
    const limit = limitRaw ? Number(limitRaw) : 20;
    const offset = offsetRaw ? Number(offsetRaw) : 0;

    if (
      maxPriceRaw !== null &&
      maxPriceRaw !== "" &&
      (Number.isNaN(maxPriceParsed!) || maxPriceParsed! < 0)
    ) {
      return NextResponse.json({ error: "Invalid maxPrice" }, { status: 400 });
    }

    const { djs } = await listDjs({
      q,
      genre,
      location,
      maxPrice:
        maxPriceParsed != null && !Number.isNaN(maxPriceParsed)
          ? maxPriceParsed
          : null,
      limit: Number.isNaN(limit) ? 20 : limit,
      offset: Number.isNaN(offset) ? 0 : offset,
    });

    return NextResponse.json({ djs });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load DJs" },
      { status: 500 }
    );
  }
}
