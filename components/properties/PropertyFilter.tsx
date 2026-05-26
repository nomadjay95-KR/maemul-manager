"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { FILTER_KEYS } from "@/lib/constants/filterRanges";
import FilterPanel from "./FilterPanel";

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "active", label: "가능" },
  { value: "reserved", label: "계약중" },
  { value: "completed", label: "완료" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "villa", label: "빌라" },
  { value: "shop", label: "상가" },
] as const;

const SORT_OPTIONS = [
  { value: "", label: "최신순" },
  { value: "deposit_asc", label: "보증금 낮은순" },
  { value: "deposit_desc", label: "보증금 높은순" },
  { value: "status", label: "상태순" },
] as const;

export default function PropertyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentType = searchParams.get("type") ?? "";
  const currentOrderBy = searchParams.get("orderBy") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [filterOpen, setFilterOpen] = useState(false);

  // 적용된 필터 개수
  const activeFilterCount = FILTER_KEYS.filter(
    (k) => !!searchParams.get(k)
  ).length;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("tab", "properties");
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

      {/* 타입 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateFilter("type", opt.value)}
            className={cn(
              "h-11 px-4 rounded-full text-[15px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
              currentType === opt.value
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground border border-border hover:bg-accent"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 검색 + 필터 + 정렬 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          placeholder="주소 검색"
          className="flex-1 h-[52px] px-4 rounded-xl border border-border bg-white text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => setFilterOpen(true)}
          className={cn(
            "h-[48px] px-4 rounded-xl text-[15px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
            activeFilterCount > 0
              ? "bg-primary text-white"
              : "bg-white text-muted-foreground border border-border hover:bg-accent"
          )}
        >
          필터{activeFilterCount > 0 ? ` ${activeFilterCount}` : ""}
        </button>
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
      </div>

      {/* 필터 패널 */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
