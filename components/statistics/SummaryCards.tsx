import { formatPrice } from "@/lib/format/property";

interface SummaryCardsProps {
  contractCount: number;
  expectedRevenue: number;
}

export default function SummaryCards({
  contractCount,
  expectedRevenue,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-50 rounded-2xl p-5">
        <p className="text-base text-blue-600 font-medium">이번 달 계약</p>
        <p className="text-3xl font-bold text-blue-700 mt-2">
          {contractCount}건
        </p>
      </div>
      <div className="bg-green-50 rounded-2xl p-5">
        <p className="text-base text-green-600 font-medium">예상 수익</p>
        <p className="text-3xl font-bold text-green-700 mt-2">
          {expectedRevenue > 0 ? formatPrice(expectedRevenue) : "-"}
        </p>
      </div>
    </div>
  );
}
