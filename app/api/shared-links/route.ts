import { NextResponse } from "next/server";
import { createSharedLink } from "@/lib/actions/sharedLink";

export async function POST(request: Request) {
  const body = await request.json();
  const { propertyIds } = body;

  if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
    return NextResponse.json(
      { error: "매물을 선택해주세요." },
      { status: 400 }
    );
  }

  const result = await createSharedLink(propertyIds);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ token: result.token });
}
