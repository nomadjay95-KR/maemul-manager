import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { propertySchema } from "@/lib/validations/property";

export async function POST(request: Request) {
  const supabase = getSupabase();

  const formData = await request.formData();
  const rawData = formData.get("data");
  const imageFiles = formData.getAll("images") as File[];

  if (!rawData || typeof rawData !== "string") {
    return NextResponse.json({ error: "데이터가 없습니다." }, { status: 400 });
  }

  // 유효성 검증
  const parsed = propertySchema.safeParse(JSON.parse(rawData));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // 빈 문자열을 null로 변환
  const cleaned = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v])
  );

  // properties INSERT
  const { data: property, error: insertError } = await supabase
    .from("properties")
    .insert(cleaned)
    .select("id")
    .single();

  if (insertError || !property) {
    console.error("Failed to insert property:", insertError?.message);
    return NextResponse.json(
      { error: "매물 등록에 실패했습니다." },
      { status: 500 }
    );
  }

  // 이미지 업로드
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${property.id}/${Date.now()}_${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("property-photos")
      .upload(path, file);

    if (uploadError) {
      console.error("Failed to upload image:", uploadError.message);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("property-photos").getPublicUrl(path);

    await supabase.from("property_images").insert({
      property_id: property.id,
      image_url: publicUrl,
      sort_order: i,
    });
  }

  return NextResponse.json({ id: property.id });
}
