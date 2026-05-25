import { NextResponse } from "next/server";
import { updateProperty, deleteProperty } from "@/lib/actions/property";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const formData = await request.formData();
  const rawData = formData.get("data");
  const imageFiles = formData.getAll("images") as File[];
  const rawDeletedIds = formData.get("deletedImageIds");
  const deletedImageIds: string[] = rawDeletedIds
    ? JSON.parse(rawDeletedIds as string)
    : [];

  if (!rawData || typeof rawData !== "string") {
    return NextResponse.json({ error: "데이터가 없습니다." }, { status: 400 });
  }

  const result = await updateProperty(
    id,
    JSON.parse(rawData),
    imageFiles,
    deletedImageIds
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const response: { id: string; warning?: string } = { id: result.id };
  if ("warning" in result) response.warning = result.warning;
  return NextResponse.json(response);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await deleteProperty(id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
