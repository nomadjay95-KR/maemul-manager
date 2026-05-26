"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import type { SharedLink } from "@/types/sharedLink";
import { cn } from "@/lib/utils";

interface SharedLinkWithMeta extends SharedLink {
  property_count: number;
  property_addresses: string[];
}

export default function SharedLinkManagement({
  links,
}: {
  links: SharedLinkWithMeta[];
}) {
  if (links.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-base text-muted-foreground">
          생성된 공유 링크가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {links.map((link) => (
        <SharedLinkRow key={link.id} link={link} />
      ))}
    </div>
  );
}

function SharedLinkRow({ link }: { link: SharedLinkWithMeta }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${link.token}`;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shared-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !link.is_active }),
      });
      if (!res.ok) throw new Error();
      toast(
        link.is_active ? "링크가 비활성화되었습니다" : "링크가 활성화되었습니다",
        "success"
      );
      router.refresh();
    } catch {
      toast("처리에 실패했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 공유 링크를 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shared-links/${link.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast("링크가 삭제되었습니다", "success");
      router.refresh();
    } catch {
      toast("삭제에 실패했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("링크가 복사되었습니다", "success");
    } catch {
      toast("링크 복사에 실패했습니다", "error");
    }
  };

  const createdDate = new Date(link.created_at).toLocaleDateString("ko-KR");

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-colors",
        link.is_active
          ? "border-border bg-white"
          : "border-gray-200 bg-gray-50 opacity-70"
      )}
    >
      {/* 상단: 매물 정보 + 상태 배지 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "h-7 inline-flex items-center px-2.5 rounded text-[13px] font-semibold",
                link.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {link.is_active ? "활성" : "비활성"}
            </span>
            <span className="text-sm text-muted-foreground">
              매물 {link.property_count}건
            </span>
          </div>
          {link.property_addresses.length > 0 && (
            <p className="text-base font-medium text-foreground truncate">
              {link.property_addresses[0]}
              {link.property_addresses.length > 1 &&
                ` 외 ${link.property_addresses.length - 1}건`}
            </p>
          )}
        </div>
      </div>

      {/* 조회수 + 날짜 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span>조회 {link.view_count}회</span>
        <span>{createdDate} 생성</span>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={!link.is_active}
          className="flex-1 h-[44px] rounded-xl text-sm font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          링크 복사
        </button>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "h-[44px] px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50",
            link.is_active
              ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          )}
        >
          {link.is_active ? "비활성화" : "활성화"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="h-[44px] px-4 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
