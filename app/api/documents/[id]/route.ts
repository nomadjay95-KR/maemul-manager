import { NextResponse } from "next/server";
import { deleteDocument } from "@/lib/actions/document";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(_request.url);
  const propertyId = url.searchParams.get("propertyId");

  if (!propertyId) {
    return NextResponse.json(
      { error: "propertyId가 필요합니다." },
      { status: 400 }
    );
  }

  const result = await deleteDocument(id, propertyId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
