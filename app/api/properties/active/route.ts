import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("properties")
    .select("id, address, type")
    .in("status", ["active", "reserved"])
    .order("address", { ascending: true });

  if (error) {
    console.error("Failed to fetch active properties:", error.message);
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}
