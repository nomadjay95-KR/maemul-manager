import type { Property } from "@/types/property";

export const DEAL_LABEL = {
  monthly: "월세",
  jeonse: "전세",
  sale: "매매",
} as const;

export function formatPrice(value: number | null): string {
  if (value == null) return "-";
  if (value >= 10000)
    return `${(value / 10000).toFixed(value % 10000 === 0 ? 0 : 1)}억`;
  return `${value.toLocaleString()}만`;
}

export function getPriceText(p: Property): string {
  switch (p.deal_type) {
    case "monthly":
      return `${formatPrice(p.deposit)} / ${formatPrice(p.monthly_rent)}`;
    case "jeonse":
      return formatPrice(p.jeonse_price);
    case "sale":
      return formatPrice(p.sale_price);
  }
}
