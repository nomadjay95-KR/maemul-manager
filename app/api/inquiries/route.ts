import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/actions/inquiry";

export async function POST(request: Request) {
  const data = await request.json();

  const result = await createInquiry(data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id });
}
