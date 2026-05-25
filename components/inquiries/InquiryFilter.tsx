"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "resolved", label: "완료" },
] as const;

export default function InquiryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";

  const updateFilter = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("status", value);
      } else {
        params.delete("status");
      }
      params.set("tab", "inquiries");
      router.push(`/main?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => updateFilter(opt.value)}
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
  );
}
