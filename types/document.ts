export type DocType = "contract" | "registry" | "building" | "etc";

export interface PropertyDocument {
  id: string;
  property_id: string;
  file_url: string;
  file_name: string;
  doc_type: DocType;
  created_at: string;
}

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  contract: "계약서",
  registry: "등기부등본",
  building: "건축물대장",
  etc: "기타",
};
