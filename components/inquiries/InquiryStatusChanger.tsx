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
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          disabled={loading}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            currentStatus === opt.value
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-accent",
            loading && "opacity-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
