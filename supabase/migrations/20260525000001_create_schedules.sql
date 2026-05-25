-- ============================================================
-- Migration: 거래 일정 관리 스키마
-- Created: 2026-05-25
-- Description: schedules 테이블 생성
-- ============================================================

-- =========================
-- 1. schedules 테이블
-- =========================

CREATE TABLE schedules (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 일정 기본 정보
  title           text        NOT NULL,
  schedule_date   date        NOT NULL,
  schedule_time   time,                       -- nullable: 시간 미지정 가능
  category        text        NOT NULL CHECK (category IN ('contract', 'move_in', 'balance', 'interim', 'etc')),

  -- 매물 연결 (선택)
  property_id     uuid        REFERENCES properties(id) ON DELETE SET NULL,

  -- 메모
  memo            text,

  -- 타임스탬프
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- updated_at 트리거 (기존 함수 재사용)
CREATE TRIGGER trg_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 인덱스
CREATE INDEX idx_schedules_date ON schedules (schedule_date);
CREATE INDEX idx_schedules_category ON schedules (category);
CREATE INDEX idx_schedules_property_id ON schedules (property_id);

-- =========================
-- 2. RLS 정책
-- =========================

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to schedules"
  ON schedules FOR ALL
  USING (true)
  WITH CHECK (true);
