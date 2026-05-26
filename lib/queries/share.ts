import { getSupabase } from "@/lib/supabase";
import type { SharedLink, PublicProperty } from "@/types/sharedLink";

/**
 * 토큰으로 shared_link 조회
 */
export async function fetchSharedLink(
  token: string
): Promise<SharedLink | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("shared_links")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  return data as SharedLink;
}

/**
 * 조회수 원자적 +1
 */
export async function incrementViewCount(id: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.rpc("increment_shared_link_views", { link_id: id });
}

/**
 * 공개 필드만 select하여 매물 조회
 * 비공개: owner_phone, owner_personality, door_password, memo
 */
const PUBLIC_PROPERTY_FIELDS = [
  "id",
  "type",
  "status",
  "address",
  "deal_type",
  "deposit",
  "monthly_rent",
  "jeonse_price",
  "sale_price",
  "occupancy_status",
  "move_out_month",
  "notes",
  "unit_number",
  "rooms",
  "loan_available",
  "lighting",
  "repair_status",
  "building_age",
  "floor",
  "area",
  "premium",
  "business_restriction",
].join(", ");

export async function fetchPublicProperties(
  propertyIds: string[]
): Promise<PublicProperty[]> {
  if (propertyIds.length === 0) return [];

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("properties")
    .select(
      `${PUBLIC_PROPERTY_FIELDS}, images:property_images(id, image_url, sort_order)`
    )
    .in("id", propertyIds)
    .order("sort_order", {
      referencedTable: "property_images",
      ascending: true,
    });

  if (error || !data) return [];
  return data as unknown as PublicProperty[];
}

/**
 * 관리용: 모든 공유 링크 조회 (최신순) + 매물 주소
 */
export async function fetchSharedLinksWithAddresses(): Promise<
  (SharedLink & { property_count: number; property_addresses: string[] })[]
> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("shared_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const links = data as SharedLink[];

  // 모든 property_ids를 모아서 한번에 주소 조회
  const allIds = Array.from(new Set(links.flatMap((l) => l.property_ids)));
  const addressMap = new Map<string, string>();

  if (allIds.length > 0) {
    const { data: properties } = await supabase
      .from("properties")
      .select("id, address")
      .in("id", allIds);

    if (properties) {
      for (const p of properties) {
        addressMap.set(p.id, p.address);
      }
    }
  }

  return links.map((link) => ({
    ...link,
    property_count: link.property_ids.length,
    property_addresses: link.property_ids
      .map((id) => addressMap.get(id))
      .filter((a): a is string => !!a),
  }));
}
