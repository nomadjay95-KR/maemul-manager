import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { noteSchema } from "@/lib/validations/note";
import { cleanData } from "@/lib/utils";

export async function createNote(
  data: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = noteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { data: note, error } = await supabase
    .from("notes")
    .insert(cleaned)
    .select("id")
    .single();

  if (error || !note) {
    console.error("Failed to insert note:", error?.message);
    return { error: "메모 등록에 실패했습니다." };
  }

  revalidatePath("/main");
  revalidatePath("/notes");

  return { id: note.id };
}

export async function updateNote(
  id: string,
  data: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = noteSchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { error } = await supabase.from("notes").update(cleaned).eq("id", id);

  if (error) {
    console.error("Failed to update note:", error.message);
    return { error: "메모 수정에 실패했습니다." };
  }

  revalidatePath("/main");
  revalidatePath("/notes");

  return { id };
}

export async function deleteNote(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete note:", error.message);
    return { error: "메모 삭제에 실패했습니다." };
  }

  revalidatePath("/main");
  revalidatePath("/notes");

  return { success: true };
}
