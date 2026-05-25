import { NextResponse } from "next/server";
import { createProperty } from "@/lib/actions/property";

export async function POST(request: Request) {
  const formData = await request.formData();
  const rawData = formData.get("data");
  const imageFiles = formData.getAll("images") as File[];

  if (!rawData || typeof rawData !== "string") {
    return NextResponse.json({ error: "데이터가 없습니다." }, { status: 400 });
  }

  const result = await createProperty(JSON.parse(rawData), imageFiles);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response: { id: string; warning?: string } = { id: result.id };
  if ("warning" in result) response.warning = result.warning;
  return NextResponse.json(response);
}
