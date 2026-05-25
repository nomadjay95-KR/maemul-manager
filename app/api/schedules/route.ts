import { NextResponse } from "next/server";
import { createSchedule } from "@/lib/actions/schedule";

export async function POST(request: Request) {
  const data = await request.json();

  const result = await createSchedule(data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id });
}
