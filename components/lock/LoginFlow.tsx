"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserListItem } from "@/types/user";
import UserSelect from "./UserSelect";
import PinPad from "./PinPad";

interface Props {
  users: UserListItem[];
}

export default function LoginFlow({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const router = useRouter();

  if (selectedUser) {
    return (
      <PinPad
        userId={selectedUser.id}
        userName={selectedUser.name}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <UserSelect
      users={users}
      onSelect={setSelectedUser}
      onSignup={() => router.push("/signup")}
    />
  );
}
