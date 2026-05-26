"use client";

import { type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "resolved", label: "완료" },
] as const;

const SORT_OPTIONS = [
  { value: "", label: "최신순" },
  { value: "inquiry_date", label: "문의일순" },
] as const;

export default function InquiryFilter({ exportButton }: { exportButton?: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentOrderBy = searchParams.get("orderBy") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("tab", "inquiries");
      router.push(`/main?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    updateFilter("search", trimmed);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 상태 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateFilter("status", opt.value)}
            className={cn(
              "h-11 px-4 rounded-full text-[15px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
              currentStatus === opt.value
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground border border-border hover:bg-accent"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          placeholder="이름/연락처 검색"
          className="flex-1 h-[52px] px-4 rounded-xl border border-border bg-white text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={currentOrderBy}
          onChange={(e) => updateFilter("orderBy", e.target.value)}
          className="h-[48px] px-3 rounded-xl border border-border bg-white text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {exportButton}
      </div>
    </div>
  );
}
