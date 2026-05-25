"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/types/property";

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "active", label: "진행중" },
  { value: "resolved", label: "완료" },
];

export default function InquiryStatusChanger({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: InquiryStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (status: InquiryStatus) => {
    if (status === currentStatus || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _statusOnly: true, status }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          disabled={loading}
          className={cn(
            "h-[52px] flex-1 rounded-xl text-base font-semibold transition-colors",
            currentStatus === opt.value
              ? "bg-primary text-white"
              : "bg-white text-muted-foreground border border-border hover:bg-gray-50",
            loading && "opacity-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
