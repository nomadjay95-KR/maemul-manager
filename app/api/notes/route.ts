import { NextResponse } from "next/server";
import { createNote } from "@/lib/actions/note";

export async function POST(request: Request) {
  const data = await request.json();

  const result = await createNote(data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id });
}
