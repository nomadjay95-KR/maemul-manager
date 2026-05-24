import PinPad from "@/components/lock/PinPad";

export default function LockPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-xl font-semibold text-foreground">비밀번호 입력</h1>
        <PinPad />
      </div>
    </main>
  );
}
