import { redirect } from "next/navigation";

export default function InquiriesPage() {
  redirect("/main?tab=inquiries");
}
