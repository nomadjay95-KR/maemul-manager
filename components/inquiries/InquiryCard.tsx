import Link from "next/link";
import type { Inquiry } from "@/types/property";
import { DEAL_LABEL } from "@/lib/format/property";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  active: { label: "진행중", className: "bg-green-100 text-green-700" },
  resolved: { label: "완료", className: "bg-gray-100 text-gray-500" },
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
      className="block rounded-xl border border-border bg-white p-5 transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-foreground">{q.name}</span>
          <span className="text-sm text-muted-foreground">{q.phone}</span>
        </div>
        <span className={cn("h-7 inline-flex items-center px-2.5 rounded text-[13px] font-semibold", statusConfig.className)}>
          {statusConfig.label}
        </span>
      </div>

      {conditions.length > 0 && (
        <p className="text-[15px] text-muted-foreground">{conditions.join(" · ")}</p>
      )}

      {q.request_details && (
        <p className="text-[15px] text-muted-foreground mt-1 truncate">{q.request_details}</p>
      )}

      <p className="text-sm text-muted-foreground mt-3">{q.inquiry_date}</p>
    </Link>
  );
}
