import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/actions/inquiry";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, name, phone")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const data = await request.json();

  const result = await createInquiry(data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id });
}
