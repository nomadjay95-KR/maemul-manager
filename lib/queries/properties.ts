import { getSupabase } from "@/lib/supabase";
import type { Property, PropertyStatus, PropertyType } from "@/types/property";

export interface PropertyFilters {
  status?: PropertyStatus;
  type?: PropertyType;
}

export async function fetchProperties(
  filters?: PropertyFilters
): Promise<Property[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch properties:", error.message);
    return [];
  }

  return data as Property[];
}
