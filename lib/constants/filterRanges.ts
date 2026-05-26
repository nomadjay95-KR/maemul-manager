export interface RangeOption {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

export interface SimpleOption {
  value: string;
  label: string;
}

// 거래유형
export const DEAL_TYPE_OPTIONS: SimpleOption[] = [
  { value: "", label: "전체" },
  { value: "monthly", label: "월세" },
  { value: "jeonse", label: "전세" },
  { value: "sale", label: "매매" },
];

// 보증금 구간 (만원 단위)
export const DEPOSIT_OPTIONS: RangeOption[] = [
  { value: "", label: "전체" },
  { value: "~1000", label: "1천만↓", max: 1000 },
  { value: "1000~3000", label: "1천~3천만", min: 1000, max: 3000 },
  { value: "3000~5000", label: "3천~5천만", min: 3000, max: 5000 },
  { value: "5000~10000", label: "5천만~1억", min: 5000, max: 10000 },
  { value: "10000~", label: "1억↑", min: 10000 },
];

// 월세 구간 (만원 단위)
export const RENT_OPTIONS: RangeOption[] = [
  { value: "", label: "전체" },
  { value: "~30", label: "30만↓", max: 30 },
  { value: "30~50", label: "30~50만", min: 30, max: 50 },
  { value: "50~80", label: "50~80만", min: 50, max: 80 },
  { value: "80~100", label: "80~100만", min: 80, max: 100 },
  { value: "100~", label: "100만↑", min: 100 },
];

// 방 개수
export const ROOM_OPTIONS: SimpleOption[] = [
  { value: "", label: "전체" },
  { value: "1", label: "1개" },
  { value: "2", label: "2개" },
  { value: "3+", label: "3개+" },
];

// 입주상태
export const OCCUPANCY_OPTIONS: SimpleOption[] = [
  { value: "", label: "전체" },
  { value: "vacant", label: "공실" },
  { value: "occupied", label: "입주중" },
];

// 연식
export const AGE_OPTIONS: SimpleOption[] = [
  { value: "", label: "전체" },
  { value: "~5", label: "5년이내" },
  { value: "~10", label: "10년이내" },
  { value: "10~", label: "10년이상" },
];

// 층수
export const FLOOR_OPTIONS: SimpleOption[] = [
  { value: "", label: "전체" },
  { value: "above", label: "지상" },
  { value: "under", label: "지하" },
];

// 필터 패널에서 사용할 키 목록
export const FILTER_KEYS = [
  "dealType",
  "deposit",
  "rent",
  "rooms",
  "occupancy",
  "age",
  "floor",
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];
