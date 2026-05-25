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
    <div className="flex gap-2">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => updateFilter(opt.value)}
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
  );
}
