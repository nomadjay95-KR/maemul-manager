-- 매물 외부 공유 링크 테이블
CREATE TABLE shared_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  property_ids uuid[] NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_links_token ON shared_links(token);

-- RLS
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_shared_links" ON shared_links FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_shared_links" ON shared_links FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_shared_links" ON shared_links FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_shared_links" ON shared_links FOR DELETE TO anon USING (true);

-- 조회수 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_shared_link_views(link_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE shared_links SET view_count = view_count + 1 WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
