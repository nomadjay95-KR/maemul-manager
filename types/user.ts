export interface User {
  id: string;
  name: string;
  pin: string;
  role: "admin" | "member";
  created_at: string;
}

/** PIN 제외 — 관리 페이지용 */
export type UserPublic = Omit<User, "pin">;

/** 로그인 화면 사용자 목록용 */
export type UserListItem = Pick<User, "id" | "name">;
