import Link from "next/link";
import type { NoteWithRelations } from "@/types/note";
import NoteBadge from "./NoteBadge";

interface NoteDetailProps {
  note: NoteWithRelations;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}.${m}.${day}`;
}

export default function NoteDetail({ note }: NoteDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground break-words">
          {note.title}
        </h2>
        <Link
          href={`/notes/${note.id}/edit`}
          className="shrink-0 h-10 px-4 rounded-lg text-[15px] font-medium text-primary border border-primary hover:bg-primary/5 transition-colors flex items-center"
        >
          수정
        </Link>
      </div>

      {/* 작성일 */}
      <p className="text-sm text-muted-foreground">
        {formatDate(note.created_at)}
        {note.updated_at !== note.created_at && (
          <span className="ml-2">(수정됨 {formatDate(note.updated_at)})</span>
        )}
      </p>

      {/* 연결 배지 */}
      {(note.property || note.inquiry) && (
        <div className="flex flex-wrap gap-2">
          {note.property && (
            <NoteBadge
              type="property"
              id={note.property.id}
              label={note.property.address}
            />
          )}
          {note.inquiry && (
            <NoteBadge
              type="inquiry"
              id={note.inquiry.id}
              label={`${note.inquiry.name} ${note.inquiry.phone}`}
            />
          )}
        </div>
      )}

      {/* 내용 */}
      {note.content ? (
        <div className="text-base text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-xl p-4 min-h-[120px]">
          {note.content}
        </div>
      ) : (
        <div className="text-base text-muted-foreground bg-muted/30 rounded-xl p-4">
          내용 없음
        </div>
      )}
    </div>
  );
}
