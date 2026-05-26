import type { NoteWithRelations } from "@/types/note";
import NoteList from "./NoteList";
import NoteDetail from "./NoteDetail";
import EmptyState from "@/components/ui/EmptyState";

interface NoteLayoutProps {
  notes: NoteWithRelations[];
  selectedNoteId?: string;
}

export default function NoteLayout({
  notes,
  selectedNoteId,
}: NoteLayoutProps) {
  const selectedNote = selectedNoteId
    ? notes.find((n) => n.id === selectedNoteId) ?? null
    : notes[0] ?? null;

  return (
    <>
      {/* 모바일: 1단 피드 */}
      <div className="md:hidden">
        <NoteList notes={notes} />
      </div>

      {/* PC/태블릿: 좌우 2단 */}
      <div className="hidden md:grid md:grid-cols-[340px_1fr] gap-4 min-h-[400px]">
        {/* 왼쪽: 메모 목록 */}
        <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
          <NoteList
            notes={notes}
            selectedId={selectedNote?.id}
            twoColumn
          />
        </div>

        {/* 오른쪽: 선택 메모 상세 */}
        <div className="border-l border-border pl-4">
          {selectedNote ? (
            <NoteDetail note={selectedNote} />
          ) : (
            <EmptyState
              title="메모를 선택해주세요"
              description="왼쪽 목록에서 메모를 선택하면 내용이 표시됩니다."
            />
          )}
        </div>
      </div>
    </>
  );
}
