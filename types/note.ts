export interface Note {
  id: string;
  title: string;
  content: string | null;
  property_id: string | null;
  inquiry_id: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteInsert = Omit<Note, "id" | "created_at" | "updated_at">;

/** JOIN 결과용: 연결된 매물/문의 정보 포함 */
export interface NoteWithRelations extends Note {
  property?: { id: string; address: string; type: string } | null;
  inquiry?: { id: string; name: string; phone: string } | null;
}
