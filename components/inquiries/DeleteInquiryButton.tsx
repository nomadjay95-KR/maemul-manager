"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function DeleteInquiryButton({ inquiryId }: { inquiryId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("문의가 삭제되었습니다", "success");
        window.location.href = "/main?tab=inquiries";
      } else {
        toast("삭제에 실패했습니다. 다시 시도해주세요", "error");
      }
    } catch {
      toast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="h-12 px-4 rounded-lg text-[15px] font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
    >
      {loading ? "삭제 중..." : "삭제"}
    </button>
  );
}
