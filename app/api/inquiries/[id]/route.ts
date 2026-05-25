import { NextResponse } from "next/server";
import { updateInquiry, deleteInquiry, updateInquiryStatus } from "@/lib/actions/inquiry";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  // 상태만 변경하는 경우
  if (data._statusOnly && data.status) {
    const ok = await updateInquiryStatus(id, data.status);
    if (!ok) {
      return NextResponse.json({ error: "상태 변경에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  const result = await updateInquiry(id, data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ id: result.id });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await deleteInquiry(id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
