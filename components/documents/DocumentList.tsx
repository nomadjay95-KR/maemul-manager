"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { PropertyDocument } from "@/types/document";
import { DOC_TYPE_LABEL } from "@/types/document";

const DOC_TYPE_COLOR: Record<string, string> = {
  contract: "bg-blue-100 text-blue-700",
  registry: "bg-green-100 text-green-700",
  building: "bg-purple-100 text-purple-700",
  etc: "bg-gray-100 text-gray-600",
};

interface Props {
  documents: PropertyDocument[];
  propertyId: string;
}

export default function DocumentList({ documents, propertyId }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  if (documents.length === 0) {
    return (
      <p className="text-base text-muted-foreground py-4 text-center">
        첨부된 서류가 없습니다.
      </p>
    );
  }

  async function handleDelete(docId: string) {
    if (!confirm("이 서류를 삭제하시겠습니까?")) return;

    setDeletingId(docId);

    try {
      const res = await fetch(
        `/api/documents/${docId}?propertyId=${propertyId}`,
        { method: "DELETE" }
      );
      const result = await res.json();

      if (!res.ok || result.error) {
        toast(result.error || "삭제 실패", "error");
      } else {
        toast("서류가 삭제되었습니다.", "success");
        router.refresh();
      }
    } catch {
      toast("삭제 중 오류가 발생했습니다.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="rounded-xl border border-border p-4 flex items-center gap-3"
        >
          {/* 종류 배지 */}
          <span
            className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              DOC_TYPE_COLOR[doc.doc_type] || DOC_TYPE_COLOR.etc
            }`}
          >
            {DOC_TYPE_LABEL[doc.doc_type as keyof typeof DOC_TYPE_LABEL] ||
              doc.doc_type}
          </span>

          {/* 파일명 */}
          <span className="flex-1 text-base text-foreground truncate min-w-0">
            {doc.file_name}
          </span>

          {/* 다운로드 */}
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download={doc.file_name}
            className="shrink-0 h-[44px] px-3 inline-flex items-center rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            다운로드
          </a>

          {/* 삭제 */}
          <button
            type="button"
            onClick={() => handleDelete(doc.id)}
            disabled={deletingId === doc.id}
            className="shrink-0 h-[44px] px-3 inline-flex items-center rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deletingId === doc.id ? "삭제중…" : "삭제"}
          </button>
        </div>
      ))}
    </div>
  );
}
