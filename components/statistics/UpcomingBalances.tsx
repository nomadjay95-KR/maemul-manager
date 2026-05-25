import Link from "next/link";
import type { UpcomingBalance } from "@/lib/queries/statistics";
import { formatPrice } from "@/lib/format/property";
import EmptyState from "@/components/ui/EmptyState";

interface UpcomingBalancesProps {
  balances: UpcomingBalance[];
}

function formatDateKorean(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
}

export default function UpcomingBalances({ balances }: UpcomingBalancesProps) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <h3 className="text-base font-bold text-foreground mb-4">
        다가오는 잔금일
      </h3>
      {balances.length === 0 ? (
        <EmptyState
          title="예정된 잔금이 없습니다"
          description="잔금일 일정을 등록하면 여기에 표시됩니다."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {balances.map((b) => (
            <Link
              key={b.id}
              href={`/calendar/${b.id}/edit`}
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors min-h-[52px]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-foreground truncate">
                  {b.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateKorean(b.schedule_date)}
                  {b.property?.address && ` · ${b.property.address}`}
                </p>
              </div>
              {b.expected_fee != null && (
                <span className="text-base font-bold text-green-600 shrink-0 ml-3">
                  {formatPrice(b.expected_fee)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
