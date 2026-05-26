import { NextResponse } from "next/server";
import { fetchUsers } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await fetchUsers();
  return NextResponse.json(users);
}
