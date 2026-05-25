import Link from "next/link";
import type { Inquiry } from "@/types/property";
import { DEAL_LABEL } from "@/lib/format/property";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  active: { label: "진행중", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  resolved: { label: "완료", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
} as const;

export default function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const q = inquiry;
  const statusConfig = STATUS_CONFIG[q.status];

  const conditions: string[] = [];
  if (q.desired_deal_type) {
    conditions.push(DEAL_LABEL[q.desired_deal_type]);
  }
  if (q.desired_rooms != null) {
    conditions.push(`${q.desired_rooms}방+`);
  }
  if (q.desired_deposit_max != null) {
    conditions.push(`보증금 ~${q.desired_deposit_max.toLocaleString()}만`);
  }
  if (q.desired_rent_max != null) {
    conditions.push(`월세 ~${q.desired_rent_max.toLocaleString()}만`);
  }

  return (
    <Link
      href={`/inquiries/${q.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 active:bg-accent"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{q.name}</span>
          <span className="text-xs text-muted-foreground">{q.phone}</span>
        </div>
        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusConfig.className)}>
          {statusConfig.label}
        </span>
      </div>

      {conditions.length > 0 && (
        <p className="text-sm text-muted-foreground">{conditions.join(" · ")}</p>
      )}

      {q.request_details && (
        <p className="text-sm text-muted-foreground mt-1 truncate">{q.request_details}</p>
      )}

      <p className="text-xs text-muted-foreground mt-2">{q.inquiry_date}</p>
    </Link>
  );
}
