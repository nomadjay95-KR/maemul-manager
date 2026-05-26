"use client";

import type { UserListItem } from "@/types/user";

interface Props {
  users: UserListItem[];
  onSelect: (user: UserListItem) => void;
  onSignup: () => void;
}

export default function UserSelect({ users, onSelect, onSignup }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <h1 className="text-xl font-semibold text-foreground">사용자 선택</h1>

      <div className="w-full flex flex-col gap-3">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="w-full h-[56px] rounded-xl border border-border text-lg font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {user.name}
          </button>
        ))}
      </div>

      <button
        onClick={onSignup}
        className="text-base text-muted-foreground hover:text-foreground transition-colors mt-4"
      >
        + 새 사용자 등록
      </button>
    </div>
  );
}
