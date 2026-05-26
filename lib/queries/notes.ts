import { getSupabase } from "@/lib/supabase";
import type { NoteWithRelations } from "@/types/note";

export async function fetchNotes(): Promise<NoteWithRelations[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("notes")
    .select(
      "*, property:properties(id, address, type), inquiry:inquiries(id, name, phone)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch notes:", error.message);
    return [];
  }

  return (data ?? []).map((d) => {
    const prop = Array.isArray(d.property) ? d.property[0] : d.property;
    const inq = Array.isArray(d.inquiry) ? d.inquiry[0] : d.inquiry;
    return { ...d, property: prop ?? null, inquiry: inq ?? null } as NoteWithRelations;
  });
}

export async function fetchNoteById(
  id: string
): Promise<NoteWithRelations | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("notes")
    .select(
      "*, property:properties(id, address, type), inquiry:inquiries(id, name, phone)"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch note:", error.message);
    return null;
  }

  const prop = Array.isArray(data.property) ? data.property[0] : data.property;
  const inq = Array.isArray(data.inquiry) ? data.inquiry[0] : data.inquiry;
  return { ...data, property: prop ?? null, inquiry: inq ?? null } as NoteWithRelations;
}
