import { z } from "zod";

const baseSchema = z.object({
  // 구분
  type: z.enum(["villa", "shop"]),

  // 공통 필수
  address: z.string().min(1, "주소를 입력해주세요."),
  deal_type: z.enum(["monthly", "jeonse", "sale"]),
  occupancy_status: z.enum(["vacant", "occupied"]),

  // 공통 가격 (deal_type에 따라 조건부 필수)
  deposit: z.coerce.number().int().nonnegative().nullable().default(null),
  monthly_rent: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullable()
    .default(null),
  jeonse_price: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullable()
    .default(null),
  sale_price: z.coerce.number().int().nonnegative().nullable().default(null),

  // 공통 선택
  move_out_month: z.string().nullable().default(null),
  owner_phone: z.string().nullable().default(null),
  owner_personality: z.string().nullable().default(null),
  door_password: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  memo: z.string().nullable().default(null),

  // 빌라 전용
  unit_number: z.string().nullable().default(null),
  rooms: z.coerce.number().int().nonnegative().nullable().default(null),
  lighting: z.string().nullable().default(null),
  repair_status: z.string().nullable().default(null),
  building_age: z.coerce
    .number()
    .int()
    .nonnegative()
    .nullable()
    .default(null),
  loan_available: z.boolean().nullable().default(null),

  // 상가 전용
  floor: z.string().nullable().default(null),
  area: z.coerce.number().nonnegative().nullable().default(null),
  premium: z.coerce.number().int().nonnegative().nullable().default(null),
  business_restriction: z.string().nullable().default(null),
});

export const propertySchema = baseSchema.superRefine((data, ctx) => {
  if (data.deal_type === "monthly") {
    if (data.deposit == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "보증금을 입력해주세요.",
        path: ["deposit"],
      });
    }
    if (data.monthly_rent == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "월세를 입력해주세요.",
        path: ["monthly_rent"],
      });
    }
  }
  if (data.deal_type === "jeonse" && data.jeonse_price == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "전세금을 입력해주세요.",
      path: ["jeonse_price"],
    });
  }
  if (data.deal_type === "sale" && data.sale_price == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "매매가를 입력해주세요.",
      path: ["sale_price"],
    });
  }
});

export type PropertyFormValues = z.infer<typeof baseSchema>;
