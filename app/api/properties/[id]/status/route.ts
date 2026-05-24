import { NextResponse } from "next/server";
import { updatePropertyStatus } from "@/lib/queries/properties";
import type { PropertyStatus } from "@/types/property";

const VALID_STATUSES: PropertyStatus[] = ["active", "reserved", "completed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "유효하지 않은 상태입니다." },
      { status: 400 }
    );
  }

  const success = await updatePropertyStatus(id, status);

  if (!success) {
    return NextResponse.json(
      { error: "상태 변경에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
