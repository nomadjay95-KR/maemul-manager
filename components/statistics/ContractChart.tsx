"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MonthlyCount } from "@/lib/queries/statistics";

interface ContractChartProps {
  data: MonthlyCount[];
}

function formatMonthLabel(month: string): string {
  const m = month.split("-")[1];
  return `${parseInt(m)}월`;
}

export default function ContractChart({ data }: ContractChartProps) {
  const chartData = data.map((d) => ({
    name: formatMonthLabel(d.month),
    count: d.count,
  }));

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <h3 className="text-base font-bold text-foreground mb-4">
        월별 계약 건수
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 14 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 14 }} width={30} />
          <Tooltip
            formatter={(value) => [`${value}건`, "계약"]}
            contentStyle={{ fontSize: 14 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={
                  i === chartData.length - 1
                    ? "hsl(221, 83%, 53%)"
                    : "hsl(221, 83%, 80%)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
