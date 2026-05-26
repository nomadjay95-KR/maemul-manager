import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import type {
  Property,
  PropertyStatus,
  PropertyType,
  PropertyWithImages,
} from "@/types/property";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRangeFilter(query: any, field: string, rangeStr: string) {
  const parts = rangeStr.split("~");
  const min = parts[0] ? parseInt(parts[0], 10) : undefined;
  const max = parts[1] ? parseInt(parts[1], 10) : undefined;

  if (min !== undefined && !isNaN(min)) {
    query = query.gte(field, min);
  }
  if (max !== undefined && !isNaN(max)) {
    query = query.lte(field, max);
  }
  return query;
}

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType;
  search?: string;
  orderBy?: string;
  dealType?: string;
  deposit?: string;
  rent?: string;
  rooms?: string;
  occupancy?: string;
  age?: string;
  floor?: string;
}

export async function fetchProperties(
  filters?: PropertyFilters
): Promise<Property[]> {
  const supabase = getSupabase();
  let query = supabase.from("properties").select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  if (filters?.search) {
    query = query.or(
      `address.ilike.%${filters.search}%,memo.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    );
  }

  // 거래유형
  if (filters?.dealType) {
    query = query.eq("deal_type", filters.dealType);
  }

  // 보증금 구간
  if (filters?.deposit) {
    query = applyRangeFilter(query, "deposit", filters.deposit);
  }

  // 월세 구간
  if (filters?.rent) {
    query = applyRangeFilter(query, "monthly_rent", filters.rent);
  }

  // 방 개수
  if (filters?.rooms) {
    if (filters.rooms === "3+") {
      query = query.gte("rooms", 3);
    } else {
      query = query.eq("rooms", parseInt(filters.rooms, 10));
    }
  }

  // 입주상태
  if (filters?.occupancy) {
    query = query.eq("occupancy_status", filters.occupancy);
  }

  // 연식
  if (filters?.age) {
    if (filters.age === "~5") {
      query = query.not("building_age", "is", null).lte("building_age", 5);
    } else if (filters.age === "~10") {
      query = query.not("building_age", "is", null).lte("building_age", 10);
    } else if (filters.age === "10~") {
      query = query.gte("building_age", 10);
    }
  }

  // 층수
  if (filters?.floor) {
    if (filters.floor === "under") {
      query = query.ilike("floor", "%지하%");
    } else if (filters.floor === "above") {
      query = query.not("floor", "ilike", "%지하%");
    }
  }

  switch (filters?.orderBy) {
    case "deposit_asc":
      query = query.order("deposit", { ascending: true, nullsFirst: false });
      break;
    case "deposit_desc":
      query = query.order("deposit", { ascending: false });
      break;
    case "status":
      query = query.order("status", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch properties:", error.message);
    return [];
  }

  return data as Property[];
}

export async function fetchPropertyById(
  id: string
): Promise<PropertyWithImages | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("properties")
    .select("*, images:property_images(*)")
    .eq("id", id)
    .order("sort_order", {
      referencedTable: "property_images",
      ascending: true,
    })
    .single();

  if (error) {
    console.error("Failed to fetch property:", error.message);
    return null;
  }

  return data as PropertyWithImages;
}

export async function updatePropertyStatus(
  id: string,
  status: PropertyStatus
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("properties")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update property status:", error.message);
    return false;
  }

  revalidatePath("/main");
  revalidatePath(`/properties/${id}`);

  return true;
}
