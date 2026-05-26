import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import type { DocType } from "@/types/document";

const VALID_DOC_TYPES: DocType[] = ["contract", "registry", "building", "etc"];

export async function uploadDocument(
  propertyId: string,
  file: File,
  docType: DocType
): Promise<{ success: true } | { error: string }> {
  if (!VALID_DOC_TYPES.includes(docType)) {
    return { error: "잘못된 서류 종류입니다." };
  }

  if (!file || file.size === 0) {
    return { error: "파일이 없습니다." };
  }

  const supabase = getSupabase();

  const ext = file.name.split(".").pop() || "bin";
  const path = `${propertyId}/${Date.now()}_${docType}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("property-documents")
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("Failed to upload document:", uploadError.message);
    return { error: "서류 업로드에 실패했습니다." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-documents").getPublicUrl(path);

  const { error: insertError } = await supabase
    .from("property_documents")
    .insert({
      property_id: propertyId,
      file_url: publicUrl,
      file_name: file.name,
      doc_type: docType,
    });

  if (insertError) {
    console.error("Failed to insert document record:", insertError.message);
    // 업로드한 파일 정리
    await supabase.storage.from("property-documents").remove([path]);
    return { error: "서류 저장에 실패했습니다." };
  }

  revalidatePath(`/properties/${propertyId}`);

  return { success: true };
}

export async function deleteDocument(
  documentId: string,
  propertyId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  // 레코드 조회
  const { data: doc, error: fetchError } = await supabase
    .from("property_documents")
    .select("file_url")
    .eq("id", documentId)
    .single();

  if (fetchError || !doc) {
    return { error: "서류를 찾을 수 없습니다." };
  }

  // Storage에서 파일 삭제
  const storagePath = doc.file_url.match(/property-documents\/(.+)$/)?.[1];
  if (storagePath) {
    await supabase.storage.from("property-documents").remove([storagePath]);
  }

  // DB 레코드 삭제
  const { error: deleteError } = await supabase
    .from("property_documents")
    .delete()
    .eq("id", documentId);

  if (deleteError) {
    console.error("Failed to delete document:", deleteError.message);
    return { error: "서류 삭제에 실패했습니다." };
  }

  revalidatePath(`/properties/${propertyId}`);

  return { success: true };
}
