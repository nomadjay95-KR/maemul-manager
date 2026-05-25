import { getSupabase } from "@/lib/supabase";
import type { Inquiry, InquiryStatus, Property } from "@/types/property";

export interface InquiryFilters {
  status?: InquiryStatus;
}

export async function fetchInquiries(
  filters?: InquiryFilters
): Promise<Inquiry[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch inquiries:", error.message);
    return [];
  }

  return data as Inquiry[];
}

export async function fetchInquiryById(
  id: string
): Promise<Inquiry | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch inquiry:", error.message);
    return null;
  }

  return data as Inquiry;
}

export async function fetchMatchingProperties(
  inquiry: Inquiry
): Promise<Property[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "active");

  if (inquiry.desired_deal_type) {
    query = query.eq("deal_type", inquiry.desired_deal_type);

    if (inquiry.desired_deal_type === "monthly") {
      if (inquiry.desired_deposit_min != null) {
        query = query.gte("deposit", inquiry.desired_deposit_min);
      }
      if (inquiry.desired_deposit_max != null) {
        query = query.lte("deposit", inquiry.desired_deposit_max);
      }
      if (inquiry.desired_rent_max != null) {
        query = query.lte("monthly_rent", inquiry.desired_rent_max);
      }
    }

    if (inquiry.desired_deal_type === "jeonse") {
      if (inquiry.desired_deposit_min != null) {
        query = query.gte("jeonse_price", inquiry.desired_deposit_min);
      }
      if (inquiry.desired_deposit_max != null) {
        query = query.lte("jeonse_price", inquiry.desired_deposit_max);
      }
    }
  }

  if (inquiry.desired_rooms != null) {
    query = query.gte("rooms", inquiry.desired_rooms);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch matching properties:", error.message);
    return [];
  }

  return data as Property[];
}
