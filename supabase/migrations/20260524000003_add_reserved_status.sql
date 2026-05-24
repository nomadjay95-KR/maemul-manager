-- ============================================================
-- Migration: properties.status에 'reserved'(계약중) 상태 추가
-- Created: 2026-05-24
-- ============================================================

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE properties ADD CONSTRAINT properties_status_check
  CHECK (status IN ('active', 'reserved', 'completed'));
