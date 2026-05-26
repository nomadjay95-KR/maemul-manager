import type { UserPublic } from "@/types/user";
import UserActions from "./UserActions";

interface Props {
  users: UserPublic[];
  currentUserId?: string;
}

export default function UserManagement({ users, currentUserId }: Props) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-base">
        등록된 사용자가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-foreground">
                {user.name}
              </span>
              <span
                className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                  user.role === "admin"
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-muted-foreground"
                }`}
              >
                {user.role === "admin" ? "관리자" : "멤버"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>

          {currentUserId !== user.id && (
            <UserActions user={user} />
          )}
          {currentUserId === user.id && (
            <p className="text-sm text-muted-foreground">현재 로그인 중</p>
          )}
        </div>
      ))}
    </div>
  );
}
