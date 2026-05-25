"use client";

import { useState } from "react";

export default function DeleteInquiryButton({ inquiryId }: { inquiryId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("정말 이 문의를 삭제하시겠습니까?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.href = "/main?tab=inquiries";
      } else {
        const body = await res.json().catch(() => null);
        alert(`삭제 실패: ${body?.error || res.statusText}`);
      }
    } catch (err) {
      alert(`삭제 요청 실패: ${err}`);
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
