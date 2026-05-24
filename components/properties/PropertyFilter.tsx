"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

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

export default function PropertyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentType = searchParams.get("type") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* 상태 필터 */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateFilter("status", opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              currentStatus === opt.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 타입 필터 */}
      <div className="flex gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateFilter("type", opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              currentType === opt.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
