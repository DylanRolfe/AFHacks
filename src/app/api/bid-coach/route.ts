import { NextResponse } from "next/server";
import { companySchema } from "@/lib/validation";
import { calculateMatch } from "@/lib/matching";
import { generateCoach } from "@/lib/coach-service";
import { tenders } from "@/data/tenders";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length")) > 80000)
      return NextResponse.json(
        { error: "The profile is too large." },
        { status: 413 },
      );
    const raw = await request.text();
    if (raw.length > 80000)
      return NextResponse.json(
        { error: "The profile is too large." },
        { status: 413 },
      );
    const body = JSON.parse(raw);
    const parsed = companySchema.safeParse(body?.company);
    const tender = tenders.find((t) => t.id === body?.tender?.id);
    if (!parsed.success || !tender)
      return NextResponse.json(
        {
          error:
            "Please use a valid company profile and an opportunity from this workspace.",
        },
        { status: 400 },
      );
    // Resolve the canonical record and recompute the score; never trust client-supplied requirements or scores.
    const match = calculateMatch(parsed.data, tender);
    const result = await generateCoach(
      parsed.data,
      tender,
      match,
      process.env.DEEPSEEK_API_KEY,
    );
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn’t read this request. Please try again from the opportunity page.",
      },
      { status: 400 },
    );
  }
}
