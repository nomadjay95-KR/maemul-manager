"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PropertyStatus } from "@/types/property";

const OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "active", label: "가능" },
  { value: "reserved", label: "계약중" },
  { value: "completed", label: "완료" },
];

export default function StatusChanger({
  propertyId,
  currentStatus,
}: {
  propertyId: string;
  currentStatus: PropertyStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (status: PropertyStatus) => {
    if (status === currentStatus || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
