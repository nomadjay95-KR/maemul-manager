import SignupForm from "@/components/lock/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <SignupForm />
      </div>
    </main>
  );
}
