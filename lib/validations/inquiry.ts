import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  phone: z.string().min(1, "연락처를 입력해주세요."),
  request_details: z.string().nullable().default(null),
  desired_deal_type: z.enum(["monthly", "jeonse", "sale"]).nullable().default(null),
  desired_deposit_min: z.coerce.number().int().nonnegative().nullable().default(null),
  desired_deposit_max: z.coerce.number().int().nonnegative().nullable().default(null),
  desired_rent_max: z.coerce.number().int().nonnegative().nullable().default(null),
  desired_rooms: z.coerce.number().int().nonnegative().nullable().default(null),
  inquiry_date: z.string().min(1, "문의일을 입력해주세요."),
  response_result: z.string().nullable().default(null),
  status: z.enum(["active", "resolved"]).default("active"),
});

export type InquiryFormValues = z.infer<typeof inquirySchema>;
