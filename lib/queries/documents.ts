import { getSupabase } from "@/lib/supabase";
import type { PropertyDocument } from "@/types/document";

export async function fetchDocumentsByProperty(
  propertyId: string
): Promise<PropertyDocument[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("property_documents")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as PropertyDocument[];
}
