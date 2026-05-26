import * as XLSX from "xlsx";
import type { Property, Inquiry } from "@/types/property";

const TYPE_LABEL: Record<string, string> = {
  villa: "빌라",
  shop: "상가",
};

const STATUS_LABEL: Record<string, string> = {
  active: "가능",
  reserved: "계약중",
  completed: "완료",
};

const DEAL_LABEL: Record<string, string> = {
  monthly: "월세",
  jeonse: "전세",
  sale: "매매",
};

const OCCUPANCY_LABEL: Record<string, string> = {
  vacant: "공실",
  occupied: "입주중",
};

const INQUIRY_STATUS_LABEL: Record<string, string> = {
  active: "진행중",
  resolved: "완료",
};

function priceInManwon(value: number | null): string {
  if (value == null) return "";
  return value.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

function getDateSuffix(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function exportPropertiesToXlsx(properties: Property[]) {
  const rows = properties.map((p) => ({
    타입: TYPE_LABEL[p.type] ?? p.type,
    상태: STATUS_LABEL[p.status] ?? p.status,
    주소: p.address,
    거래유형: DEAL_LABEL[p.deal_type] ?? p.deal_type,
    "보증금(만원)": priceInManwon(p.deposit),
    "월세(만원)": priceInManwon(p.monthly_rent),
    "전세금(만원)": priceInManwon(p.jeonse_price),
    "매매가(만원)": priceInManwon(p.sale_price),
    방수: p.rooms ?? "",
    호수: p.unit_number ?? "",
    층수: p.floor ?? "",
    "면적(㎡)": p.area ?? "",
    입주상태: OCCUPANCY_LABEL[p.occupancy_status] ?? p.occupancy_status,
    연식: p.building_age ?? "",
    집주인연락처: p.owner_phone ?? "",
    특이사항: p.notes ?? "",
    메모: p.memo ?? "",
    등록일: formatDate(p.created_at),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "매물목록");

  XLSX.writeFile(wb, `매물목록_${getDateSuffix()}.xlsx`);
}

export function exportInquiriesToXlsx(inquiries: Inquiry[]) {
  const rows = inquiries.map((inq) => ({
    이름: inq.name,
    연락처: inq.phone,
    희망거래유형: inq.desired_deal_type
      ? DEAL_LABEL[inq.desired_deal_type] ?? inq.desired_deal_type
      : "",
    "희망보증금(만원)":
      inq.desired_deposit_min != null || inq.desired_deposit_max != null
        ? `${priceInManwon(inq.desired_deposit_min) || ""}~${priceInManwon(inq.desired_deposit_max) || ""}`
        : "",
    "희망월세(만원)": priceInManwon(inq.desired_rent_max),
    희망방수: inq.desired_rooms ?? "",
    문의내용: inq.request_details ?? "",
    응대결과: inq.response_result ?? "",
    상태: INQUIRY_STATUS_LABEL[inq.status] ?? inq.status,
    문의일: formatDate(inq.inquiry_date),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "문의목록");

  XLSX.writeFile(wb, `문의목록_${getDateSuffix()}.xlsx`);
}
