"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { DocType } from "@/types/document";
import { DOC_TYPE_LABEL } from "@/types/document";

const DOC_TYPES: DocType[] = ["contract", "registry", "building", "etc"];

interface Props {
  propertyId: string;
}

export default function DocumentUpload({ propertyId }: Props) {
  const [selectedType, setSelectedType] = useState<DocType>("contract");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleUpload(file: File) {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("propertyId", propertyId);
      formData.append("docType", selectedType);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast(result.error || "업로드 실패", "error");
      } else {
        toast("서류가 첨부되었습니다.", "success");
        router.refresh();
      }
    } catch {
      toast("업로드 중 오류가 발생했습니다.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 서류 종류 선택 */}
      <div className="flex flex-wrap gap-2">
        {DOC_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`h-[48px] px-4 rounded-lg text-base font-semibold transition-colors ${
              selectedType === type
                ? "bg-primary text-white"
                : "bg-gray-100 text-foreground hover:bg-gray-200"
            }`}
          >
            {DOC_TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* 파일 업로드 */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.heic"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="h-[52px] w-full rounded-xl text-[17px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            업로드 중…
          </>
        ) : (
          `${DOC_TYPE_LABEL[selectedType]} 파일 첨부`
        )}
      </button>
    </div>
  );
}
