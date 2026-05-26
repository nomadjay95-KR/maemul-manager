import { redirect } from "next/navigation";
import { fetchUsers } from "@/lib/queries/users";
import LoginFlow from "@/components/lock/LoginFlow";

export const dynamic = "force-dynamic";

export default async function LockPage() {
  const users = await fetchUsers();

  if (users.length === 0) {
    redirect("/signup");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <LoginFlow users={users} />
      </div>
    </main>
  );
}
