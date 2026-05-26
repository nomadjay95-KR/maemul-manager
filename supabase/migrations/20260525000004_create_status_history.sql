-- 매물 상태 변경 이력 테이블
CREATE TABLE IF NOT EXISTS property_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_status_history_property_id ON property_status_history(property_id);
CREATE INDEX idx_status_history_changed_at ON property_status_history(changed_at);

-- RLS
ALTER TABLE property_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_status_history" ON property_status_history
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_status_history" ON property_status_history
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_status_history" ON property_status_history
  FOR DELETE TO anon USING (true);
