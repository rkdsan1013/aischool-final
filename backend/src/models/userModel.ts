import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";

// User 타입 정의
export type User = {
  user_id: number;
  email: string;
  password: string;
};

// 이메일로 유저 찾기
export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<User[] & RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0] ?? null;
}

// 유저 생성 (email, password만 처리)
export async function createUser(user: {
  email: string;
  password: string;
}): Promise<void> {
  await pool.execute("INSERT INTO users (email, password) VALUES (?, ?)", [
    user.email,
    user.password,
  ]);
}
