import { NextResponse } from "next/server";
import { uploadDocument } from "@/lib/actions/document";
import type { DocType } from "@/types/document";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const propertyId = formData.get("propertyId") as string | null;
    const docType = formData.get("docType") as DocType | null;

    if (!file || !propertyId || !docType) {
      return NextResponse.json(
        { error: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    const result = await uploadDocument(propertyId, file, docType);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "서류 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
