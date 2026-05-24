// ============================================================
// DB 테이블 기반 TypeScript 타입 정의
// ============================================================

/** 매물 유형 */
export type PropertyType = "villa" | "shop";

/** 거래 유형 */
export type DealType = "monthly" | "jeonse" | "sale";

/** 매물 상태 */
export type PropertyStatus = "active" | "reserved" | "completed";

/** 입주 상태 */
export type OccupancyStatus = "vacant" | "occupied";

/** 문의 상태 */
export type InquiryStatus = "active" | "resolved";

// ============================================================
// properties 테이블
// ============================================================

export interface Property {
  id: string;

  // 구분
  type: PropertyType;
  status: PropertyStatus;

  // 공통 기본 정보
  address: string;
  deal_type: DealType;
  deposit: number | null;
  monthly_rent: number | null;
  jeonse_price: number | null;
  sale_price: number | null;

  // 공통 상태
  occupancy_status: OccupancyStatus;
  move_out_month: string | null;

  // 공통 연락처/보안
  owner_phone: string | null;
  owner_personality: string | null;
  door_password: string | null;

  // 공통 기타
  notes: string | null;
  memo: string | null;

  // 빌라 전용
  unit_number: string | null;
  rooms: number | null;
  loan_available: boolean | null;
  lighting: string | null;
  repair_status: string | null;
  building_age: number | null;

  // 상가 전용
  floor: string | null;
  area: number | null;
  premium: number | null;
  business_restriction: string | null;

  // 타임스탬프
  created_at: string;
  updated_at: string;
}

/** 매물 등록/수정 시 사용하는 입력 타입 (id, timestamps 제외) */
export type PropertyInsert = Omit<Property, "id" | "created_at" | "updated_at">;
export type PropertyUpdate = Partial<PropertyInsert>;

// ============================================================
// property_images 테이블
// ============================================================

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export type PropertyImageInsert = Omit<PropertyImage, "id" | "created_at">;

// ============================================================
// inquiries 테이블
// ============================================================

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  request_details: string | null;
  desired_deal_type: DealType | null;
  desired_deposit_min: number | null;
  desired_deposit_max: number | null;
  desired_rent_max: number | null;
  desired_rooms: number | null;
  inquiry_date: string;
  response_result: string | null;
  status: InquiryStatus;
  created_at: string;
}

export type InquiryInsert = Omit<Inquiry, "id" | "created_at">;
export type InquiryUpdate = Partial<InquiryInsert>;

// ============================================================
// 관계 포함 타입 (JOIN 결과용)
// ============================================================

/** 매물 + 이미지 목록 */
export interface PropertyWithImages extends Property {
  images: PropertyImage[];
}
