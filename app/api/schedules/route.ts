import { NextRequest, NextResponse } from "next/server";
import { createSchedule } from "@/lib/actions/schedule";
import { fetchSchedulesByMonth } from "@/lib/queries/schedules";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = parseInt(searchParams.get("year") || "", 10);
  const month = parseInt(searchParams.get("month") || "", 10);

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ error: "year, month 필수" }, { status: 400 });
  }

  const schedules = await fetchSchedulesByMonth(year, month);
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const data = await request.json();

  const result = await createSchedule(data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id });
}
