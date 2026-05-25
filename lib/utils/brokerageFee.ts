import type { DealType } from "@/types/property";

// 매매·교환 상한요율 (금액 단위: 만원)
const SALE_RATES = [
  { max: 5000, rate: 0.006 },
  { max: 20000, rate: 0.005 },
  { max: 90000, rate: 0.004 },
  { max: 120000, rate: 0.005 },
  { max: 150000, rate: 0.006 },
  { max: Infinity, rate: 0.007 },
];

// 임대차(전세·월세) 상한요율
const LEASE_RATES = [
  { max: 5000, rate: 0.005 },
  { max: 10000, rate: 0.004 },
  { max: 60000, rate: 0.003 },
  { max: 120000, rate: 0.004 },
  { max: 150000, rate: 0.005 },
  { max: Infinity, rate: 0.006 },
];

/**
 * 2024 법정 상한요율 기반 중개보수 계산
 * @param dealType "sale" | "jeonse" | "monthly"
 * @param amount 거래금액 (만원 단위)
 * @returns 중개보수 (만원, 내림)
 */
export function calculateFee(dealType: DealType, amount: number): number {
  const rates = dealType === "sale" ? SALE_RATES : LEASE_RATES;

  for (const { max, rate } of rates) {
    if (amount < max) {
      return Math.floor(amount * rate);
    }
  }
  return Math.floor(amount * rates[rates.length - 1].rate);
}

/**
 * 월세 거래금액 환산
 * 기본: 보증금 + (월세 × 100)
 * 환산액이 5천만원 미만이면: 보증금 + (월세 × 70)
 */
export function getMonthlyRentAmount(
  deposit: number,
  monthlyRent: number
): number {
  const standard = deposit + monthlyRent * 100;
  if (standard < 5000) {
    return deposit + monthlyRent * 70;
  }
  return standard;
}
