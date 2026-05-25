// ============================================================
// schedules 테이블 타입 정의
// ============================================================

/** 일정 종류 */
export type ScheduleCategory =
  | "contract"   // 계약서 작성
  | "move_in"    // 입주일
  | "balance"    // 잔금일
  | "interim"    // 중도금
  | "etc";       // 기타

export interface Schedule {
  id: string;
  title: string;
  schedule_date: string;
  schedule_time: string | null;
  category: ScheduleCategory;
  property_id: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduleInsert = Omit<Schedule, "id" | "created_at" | "updated_at">;

/** 일정 + 연결 매물 정보 (JOIN 결과) */
export interface ScheduleWithProperty extends Schedule {
  property?: {
    id: string;
    address: string;
    type: string;
  } | null;
}
