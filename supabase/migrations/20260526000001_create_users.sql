-- 사용자 테이블
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  pin text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_users_name ON users(name);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_anon" ON users
  FOR SELECT TO anon USING (true);

CREATE POLICY "users_insert_anon" ON users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "users_update_anon" ON users
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "users_delete_anon" ON users
  FOR DELETE TO anon USING (true);
