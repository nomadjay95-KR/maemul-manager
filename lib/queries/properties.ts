import { getSupabase } from "@/lib/supabase";
import type {
  Property,
  PropertyStatus,
  PropertyType,
  PropertyWithImages,
} from "@/types/property";

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

  return true;
}
