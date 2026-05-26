export interface SharedLink {
  id: string;
  token: string;
  property_ids: string[];
  is_active: boolean;
  view_count: number;
  created_at: string;
}

/** 공개 페이지에서 사용하는 매물 (비공개 필드 제외) */
export interface PublicProperty {
  id: string;
  type: "villa" | "shop";
  status: "active" | "reserved" | "completed";
  address: string;
  deal_type: "monthly" | "jeonse" | "sale";
  deposit: number | null;
  monthly_rent: number | null;
  jeonse_price: number | null;
  sale_price: number | null;
  occupancy_status: "vacant" | "occupied";
  move_out_month: string | null;
  notes: string | null; // 특이사항 (공개)
  // 빌라
  unit_number: string | null;
  rooms: number | null;
  loan_available: boolean | null;
  lighting: string | null;
  repair_status: string | null;
  building_age: number | null;
  // 상가
  floor: string | null;
  area: number | null;
  premium: number | null;
  business_restriction: string | null;
  // 이미지
  images: { id: string; image_url: string; sort_order: number }[];
}
