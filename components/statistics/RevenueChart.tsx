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
import type { MonthlyRevenue } from "@/lib/queries/statistics";
import { formatPrice } from "@/lib/format/property";

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

function formatMonthLabel(month: string): string {
  const m = month.split("-")[1];
  return `${parseInt(m)}월`;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    name: formatMonthLabel(d.month),
    total: d.total,
  }));

  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <h3 className="text-base font-bold text-foreground mb-4">
        월별 예상 수익
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 14 }} />
          <YAxis
            tick={{ fontSize: 14 }}
            width={60}
            tickFormatter={(v) => (v === 0 ? "0" : formatPrice(v))}
          />
          <Tooltip
            formatter={(value) => [
              Number(value) > 0 ? formatPrice(Number(value)) : "0",
              "수익",
            ]}
            contentStyle={{ fontSize: 14 }}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={
                  i === chartData.length - 1
                    ? "hsl(142, 71%, 45%)"
                    : "hsl(142, 71%, 75%)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
