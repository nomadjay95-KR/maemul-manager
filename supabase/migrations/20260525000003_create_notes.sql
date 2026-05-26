-- 메모장 테이블
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  inquiry_id uuid REFERENCES inquiries(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_property_id ON notes(property_id);
CREATE INDEX idx_notes_inquiry_id ON notes(inquiry_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- RLS 활성화 + anon 허용
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_anon" ON notes
  FOR SELECT TO anon USING (true);

CREATE POLICY "notes_insert_anon" ON notes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "notes_update_anon" ON notes
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "notes_delete_anon" ON notes
  FOR DELETE TO anon USING (true);
