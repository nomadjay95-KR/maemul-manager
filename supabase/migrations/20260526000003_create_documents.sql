-- 매물별 서류 첨부 테이블
CREATE TABLE property_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('contract', 'registry', 'building', 'etc')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);

-- RLS
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_property_documents" ON property_documents
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_property_documents" ON property_documents
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_delete_property_documents" ON property_documents
  FOR DELETE TO anon USING (true);

-- Storage: property-documents 버킷
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "anon_select_property_documents_storage" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'property-documents');
CREATE POLICY "anon_insert_property_documents_storage" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'property-documents');
CREATE POLICY "anon_delete_property_documents_storage" ON storage.objects
  FOR DELETE TO anon USING (bucket_id = 'property-documents');
