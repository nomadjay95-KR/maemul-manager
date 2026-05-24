-- ============================================================
-- Migration: 매물 관리 시스템 초기 스키마
-- Created: 2026-05-24
-- Description: properties, property_images, inquiries 테이블 생성
-- ============================================================

-- =========================
-- 1. 유틸리티 함수
-- =========================

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- 2. properties 테이블
-- =========================

CREATE TABLE properties (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 구분
  type            text        NOT NULL CHECK (type IN ('villa', 'shop')),
  status          text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),

  -- 공통 기본 정보
  address         text        NOT NULL,
  deal_type       text        NOT NULL CHECK (deal_type IN ('monthly', 'jeonse', 'sale')),
  deposit         integer,                -- 보증금 (만원)
  monthly_rent    integer,                -- 월세 (만원)
  jeonse_price    integer,                -- 전세금 (만원)
  sale_price      integer,                -- 매매가 (만원)

  -- 공통 상태
  occupancy_status text       NOT NULL DEFAULT 'vacant' CHECK (occupancy_status IN ('vacant', 'occupied')),
  move_out_month  text,                   -- 이사 예정월 (예: '2026-08')

  -- 공통 연락처/보안
  owner_phone     text,                   -- 집주인/임대인 연락처
  owner_personality text,                 -- 임대인 성향
  door_password   text,                   -- 집 비밀번호

  -- 공통 기타
  notes           text,                   -- 특이사항
  memo            text,                   -- 자유 메모

  -- 빌라 전용
  unit_number     text,                   -- 호수 (예: 201호)
  rooms           integer,                -- 방 개수
  loan_available  boolean,                -- 대출 가능 여부 (전세)
  lighting        text,                   -- 채광
  repair_status   text,                   -- 수리 상태
  building_age    integer,                -- 연식 (년)

  -- 상가 전용
  floor           text,                   -- 층수
  area            numeric(10,2),          -- 면적 (m²)
  premium         integer,                -- 권리금 (만원)
  business_restriction text,              -- 업종 제한

  -- 타임스탬프
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- updated_at 트리거
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 인덱스
CREATE INDEX idx_properties_type_status ON properties (type, status);
CREATE INDEX idx_properties_deal_type ON properties (deal_type);
CREATE INDEX idx_properties_deposit ON properties (deposit);
CREATE INDEX idx_properties_rooms ON properties (rooms);
CREATE INDEX idx_properties_address ON properties USING gin (to_tsvector('simple', address));

-- =========================
-- 3. property_images 테이블
-- =========================

CREATE TABLE property_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url     text        NOT NULL,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property_id ON property_images (property_id);

-- =========================
-- 4. inquiries 테이블 (Phase 2 선설계)
-- =========================

CREATE TABLE inquiries (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text        NOT NULL,
  phone               text        NOT NULL,
  request_details     text,                   -- 문의 사항 (원하는 조건 자유기술)
  desired_deal_type   text        CHECK (desired_deal_type IS NULL OR desired_deal_type IN ('monthly', 'jeonse', 'sale')),
  desired_deposit_min integer,                -- 희망 보증금 하한 (만원)
  desired_deposit_max integer,                -- 희망 보증금 상한 (만원)
  desired_rent_max    integer,                -- 희망 월세 상한 (만원)
  desired_rooms       integer,                -- 희망 방 개수
  inquiry_date        date        NOT NULL DEFAULT CURRENT_DATE,
  response_result     text,                   -- 응대 결과
  status              text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_status ON inquiries (status);
CREATE INDEX idx_inquiries_desired_deal_type ON inquiries (desired_deal_type);

-- =========================
-- 5. RLS 정책
-- =========================

-- RLS 활성화
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- anon/authenticated 모두 전체 접근 허용
-- (앱 레벨 비밀번호 잠금으로 보안 처리)

CREATE POLICY "Allow all access to properties"
  ON properties FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to property_images"
  ON property_images FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to inquiries"
  ON inquiries FOR ALL
  USING (true)
  WITH CHECK (true);

-- =========================
-- 6. Storage 버킷 (Supabase Dashboard에서 생성 또는 아래 SQL)
-- =========================

-- NOTE: Supabase Storage 버킷 생성은 Dashboard 또는 Management API 사용 권장
-- 아래는 참고용 (supabase CLI로 실행 시 동작)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책: 누구나 읽기, anon도 업로드/삭제 가능
CREATE POLICY "Public read access for property-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

CREATE POLICY "Allow upload to property-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Allow delete from property-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-photos');
