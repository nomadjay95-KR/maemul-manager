import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().nullable().default(null),
  property_id: z.string().uuid().nullable().default(null),
  inquiry_id: z.string().uuid().nullable().default(null),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
