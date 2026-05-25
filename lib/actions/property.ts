import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { propertySchema } from "@/lib/validations/property";

function cleanData(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
  );
}

async function uploadImages(
  propertyId: string,
  files: File[],
  startOrder = 0
): Promise<{ failed: number }> {
  const supabase = getSupabase();
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${propertyId}/${Date.now()}_${i}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("property-photos")
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Failed to upload image:", uploadError.message);
      failed++;
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("property-photos").getPublicUrl(path);

    await supabase.from("property_images").insert({
      property_id: propertyId,
      image_url: publicUrl,
      sort_order: startOrder + i,
    });
  }

  return { failed };
}

export async function createProperty(
  data: Record<string, unknown>,
  imageFiles: File[]
): Promise<{ id: string; warning?: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = propertySchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { data: property, error: insertError } = await supabase
    .from("properties")
    .insert(cleaned)
    .select("id")
    .single();

  if (insertError || !property) {
    console.error("Failed to insert property:", insertError?.message);
    return { error: "매물 등록에 실패했습니다." };
  }

  const { failed } = await uploadImages(property.id, imageFiles);

  revalidatePath("/main");
  revalidatePath(`/properties/${property.id}`);

  if (failed > 0) {
    return { id: property.id, warning: `${failed}장의 사진 업로드에 실패했습니다` };
  }

  return { id: property.id };
}

export async function updateProperty(
  id: string,
  data: Record<string, unknown>,
  imageFiles: File[],
  deletedImageIds: string[]
): Promise<{ id: string; warning?: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = propertySchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { error: updateError } = await supabase
    .from("properties")
    .update(cleaned)
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update property:", updateError.message);
    return { error: "매물 수정에 실패했습니다." };
  }

  // 삭제된 이미지 처리
  for (const imageId of deletedImageIds) {
    const { data: img } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (img) {
      const pathMatch = img.image_url.match(/property-photos\/(.+)$/);
      if (pathMatch) {
        await supabase.storage.from("property-photos").remove([pathMatch[1]]);
      }
    }

    await supabase.from("property_images").delete().eq("id", imageId);
  }

  // 새 이미지 업로드
  const { count } = await supabase
    .from("property_images")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id);

  const { failed } = await uploadImages(id, imageFiles, count ?? 0);

  revalidatePath("/main");
  revalidatePath(`/properties/${id}`);

  if (failed > 0) {
    return { id, warning: `${failed}장의 사진 업로드에 실패했습니다` };
  }

  return { id };
}

export async function deleteProperty(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  // Storage 폴더 삭제
  const { data: files } = await supabase.storage
    .from("property-photos")
    .list(id);

  if (files && files.length > 0) {
    const paths = files.map((f) => `${id}/${f.name}`);
    await supabase.storage.from("property-photos").remove(paths);
  }

  // properties 삭제 (property_images는 CASCADE)
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete property:", error.message);
    return { error: "매물 삭제에 실패했습니다." };
  }

  revalidatePath("/main");

  return { success: true };
}
