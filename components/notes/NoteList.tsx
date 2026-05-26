"use client";

import Link from "next/link";
import type { NoteWithRelations } from "@/types/note";
import NoteBadge from "./NoteBadge";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: NoteWithRelations[];
  /** 데스크톱 2단 레이아웃에서 선택된 메모 ID */
  selectedId?: string;
  /** 데스크톱 2단 레이아웃 모드 여부 */
  twoColumn?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

export default function NoteList({
  notes,
  selectedId,
  twoColumn,
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <EmptyState title="메모가 없습니다" description="새 메모를 작성해보세요." />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => {
        const isSelected = twoColumn && note.id === selectedId;
        const href = twoColumn
          ? `/main?tab=notes&noteId=${note.id}`
          : `/notes/${note.id}`;

        return (
          <Link
            key={note.id}
            href={href}
            className={cn(
              "block rounded-xl border border-border p-4 transition-colors hover:bg-muted/30",
              isSelected && "bg-primary/5 border-primary"
            )}
          >
            {/* 제목 + 날짜 */}
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-foreground truncate">
                {note.title}
              </h3>
              <span className="shrink-0 text-sm text-muted-foreground">
                {formatDate(note.created_at)}
              </span>
            </div>

            {/* 내용 미리보기 */}
            {note.content && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {note.content}
              </p>
            )}

            {/* 연결 배지 */}
            {(note.property || note.inquiry) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
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
                    label={note.inquiry.name}
                  />
                )}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
