import { getSupabase } from "@/lib/supabase";
import type { Inquiry, InquiryStatus, Property, PropertyWithImages } from "@/types/property";

export interface InquiryFilters {
  status?: InquiryStatus;
  search?: string;
  orderBy?: string;
}

export async function fetchInquiries(
  filters?: InquiryFilters
): Promise<Inquiry[]> {
  const supabase = getSupabase();
  let query = supabase.from("inquiries").select("*");

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  switch (filters?.orderBy) {
    case "inquiry_date":
      query = query.order("inquiry_date", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
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

export async function fetchMatchingInquiries(
  property: Property | PropertyWithImages
): Promise<Inquiry[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("inquiries")
    .select("*")
    .eq("status", "active");

  // 거래유형: 문의의 희망 거래유형이 null이거나 매물과 일치
  query = query.or(
    `desired_deal_type.is.null,desired_deal_type.eq.${property.deal_type}`
  );

  // 가격 매칭
  const price =
    property.deal_type === "monthly"
      ? property.deposit
      : property.deal_type === "jeonse"
        ? property.jeonse_price
        : property.sale_price;

  if (price != null) {
    // 문의의 희망 보증금 최소가 null이거나 매물 가격 이하
    query = query.or(
      `desired_deposit_min.is.null,desired_deposit_min.lte.${price}`
    );
    // 문의의 희망 보증금 최대가 null이거나 매물 가격 이상
    query = query.or(
      `desired_deposit_max.is.null,desired_deposit_max.gte.${price}`
    );
  }

  // 월세 매칭
  if (property.deal_type === "monthly" && property.monthly_rent != null) {
    query = query.or(
      `desired_rent_max.is.null,desired_rent_max.gte.${property.monthly_rent}`
    );
  }

  // 방 개수 매칭: 문의의 희망 방 수가 null이거나 매물 방 수 이하
  if (property.rooms != null) {
    query = query.or(
      `desired_rooms.is.null,desired_rooms.lte.${property.rooms}`
    );
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch matching inquiries:", error.message);
    return [];
  }

  return data as Inquiry[];
}
