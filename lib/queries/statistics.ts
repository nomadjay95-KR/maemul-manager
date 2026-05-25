import { getSupabase } from "@/lib/supabase";

// ============================================================
// 타입 정의
// ============================================================

export interface MonthlyCount {
  month: string; // "YYYY-MM"
  count: number;
}

export interface MonthlyRevenue {
  month: string; // "YYYY-MM"
  total: number; // 만원
}

export interface UpcomingBalance {
  id: string;
  title: string;
  schedule_date: string;
  property_id: string | null;
  property?: { id: string; address: string; type: string } | null;
  expected_fee: number | null;
}

// ============================================================
// 헬퍼
// ============================================================

function getThreeMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`;

  const endMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const endYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const endStr = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

  return { startStr, endStr };
}

function getCurrentMonthRange() {
  const now = new Date();
  const startStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const endMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const endYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const endStr = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

  return { startStr, endStr };
}

/** 최근 3개월 키 리스트 (빈 값이어도 0으로 표시하기 위해) */
function getThreeMonthKeys(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return keys;
}

// ============================================================
// 쿼리 함수
// ============================================================

/**
 * 최근 3개월 월별 계약 건수
 */
export async function fetchMonthlyContracts(): Promise<MonthlyCount[]> {
  const supabase = getSupabase();
  const { startStr, endStr } = getThreeMonthRange();

  const { data, error } = await supabase
    .from("schedules")
    .select("schedule_date")
    .eq("category", "contract")
    .gte("schedule_date", startStr)
    .lt("schedule_date", endStr);

  if (error || !data) return getThreeMonthKeys().map((m) => ({ month: m, count: 0 }));

  // JS에서 월별 그룹핑
  const counts = new Map<string, number>();
  for (const d of data) {
    const month = (d.schedule_date as string).substring(0, 7);
    counts.set(month, (counts.get(month) || 0) + 1);
  }

  return getThreeMonthKeys().map((m) => ({
    month: m,
    count: counts.get(m) || 0,
  }));
}

/**
 * 최근 3개월 월별 수익
 * 로직: contract의 fee → 같은 property_id의 balance 월에 귀속
 */
export async function fetchMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const supabase = getSupabase();
  const { startStr, endStr } = getThreeMonthRange();

  // 1. fee가 있는 계약서 일정 (property_id 필수)
  const { data: contracts, error: e1 } = await supabase
    .from("schedules")
    .select("property_id, fee")
    .eq("category", "contract")
    .not("fee", "is", null)
    .not("property_id", "is", null);

  if (e1 || !contracts || contracts.length === 0) {
    return getThreeMonthKeys().map((m) => ({ month: m, total: 0 }));
  }

  // 2. 최근 3개월 잔금일 일정
  const propertyIds = Array.from(
    new Set(contracts.map((c) => c.property_id).filter(Boolean) as string[])
  );

  const { data: balances, error: e2 } = await supabase
    .from("schedules")
    .select("property_id, schedule_date")
    .eq("category", "balance")
    .in("property_id", propertyIds)
    .gte("schedule_date", startStr)
    .lt("schedule_date", endStr);

  if (e2 || !balances) {
    return getThreeMonthKeys().map((m) => ({ month: m, total: 0 }));
  }

  // 3. property_id → balance 월 매핑 (가장 빠른 잔금일)
  const balanceMap = new Map<string, string>();
  for (const b of balances) {
    if (!b.property_id) continue;
    const existing = balanceMap.get(b.property_id as string);
    if (!existing || (b.schedule_date as string) < existing) {
      balanceMap.set(b.property_id as string, b.schedule_date as string);
    }
  }

  // 4. contract fee → balance 월에 귀속
  const monthlyFees = new Map<string, number>();
  for (const c of contracts) {
    if (!c.property_id || !c.fee) continue;
    const balanceDate = balanceMap.get(c.property_id as string);
    if (!balanceDate) continue;

    const monthKey = balanceDate.substring(0, 7);
    monthlyFees.set(monthKey, (monthlyFees.get(monthKey) || 0) + (c.fee as number));
  }

  return getThreeMonthKeys().map((m) => ({
    month: m,
    total: monthlyFees.get(m) || 0,
  }));
}

/**
 * 다가오는 잔금일 일정 (오늘 이후, 최대 10건)
 */
export async function fetchUpcomingBalances(): Promise<UpcomingBalance[]> {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("schedules")
    .select("id, title, schedule_date, property_id, property:properties(id, address, type)")
    .eq("category", "balance")
    .gte("schedule_date", today)
    .order("schedule_date", { ascending: true })
    .limit(10);

  if (error || !data) return [];

  // 연결 매물의 contract fee 조회
  const propertyIds = data
    .map((d) => d.property_id)
    .filter(Boolean) as string[];

  const feeMap = new Map<string, number>();
  if (propertyIds.length > 0) {
    const { data: contracts } = await supabase
      .from("schedules")
      .select("property_id, fee")
      .eq("category", "contract")
      .in("property_id", propertyIds)
      .not("fee", "is", null);

    if (contracts) {
      for (const c of contracts) {
        if (c.property_id && c.fee) {
          feeMap.set(c.property_id as string, c.fee as number);
        }
      }
    }
  }

  return data.map((d) => {
    const prop = Array.isArray(d.property) ? d.property[0] : d.property;
    return {
      id: d.id as string,
      title: d.title as string,
      schedule_date: d.schedule_date as string,
      property_id: d.property_id as string | null,
      property: prop as UpcomingBalance["property"],
      expected_fee: d.property_id
        ? feeMap.get(d.property_id as string) || null
        : null,
    };
  });
}

/**
 * 이번 달 요약: 계약 건수 + 예상 수익
 */
export async function fetchCurrentMonthSummary(): Promise<{
  contractCount: number;
  expectedRevenue: number;
}> {
  const supabase = getSupabase();
  const { startStr, endStr } = getCurrentMonthRange();

  // 이번 달 계약 건수
  const { data: contracts } = await supabase
    .from("schedules")
    .select("id")
    .eq("category", "contract")
    .gte("schedule_date", startStr)
    .lt("schedule_date", endStr);

  // 이번 달 잔금일 → 해당 매물의 contract fee 합산
  const { data: balances } = await supabase
    .from("schedules")
    .select("property_id")
    .eq("category", "balance")
    .gte("schedule_date", startStr)
    .lt("schedule_date", endStr)
    .not("property_id", "is", null);

  let expectedRevenue = 0;
  if (balances && balances.length > 0) {
    const propIds = balances
      .map((b) => b.property_id)
      .filter(Boolean) as string[];

    const { data: feeContracts } = await supabase
      .from("schedules")
      .select("fee")
      .eq("category", "contract")
      .in("property_id", propIds)
      .not("fee", "is", null);

    expectedRevenue = (feeContracts || []).reduce(
      (sum, c) => sum + ((c.fee as number) || 0),
      0
    );
  }

  return {
    contractCount: contracts?.length || 0,
    expectedRevenue,
  };
}
