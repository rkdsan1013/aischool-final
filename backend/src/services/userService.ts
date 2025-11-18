// backend/src/services/userService.ts
import { pool } from "../config/db";
// ✅ ResultSetHeader 추가 (INSERT 결과에서 insertId를 얻기 위해)
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * DB에서 사용하는 유저/프로필 타입 정의
 */
export type UserRow = {
  user_id: number;
  email: string;
  // --- [수정됨] ---
  // exactOptionalPropertyTypes: true 규칙을 위해 | undefined 추가
  password?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
  // --- [수정 완료] ---

  // profile fields (joined)
  // (null은 DB에서 오는 값이므로 | null은 그대로 둡니다)
  name?: string | null | undefined;
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null | undefined;
  level_progress?: number | null | undefined;
  profile_img?: string | null | undefined;

  // stats stored in user_profiles per current schema
  streak_count?: number | null | undefined;
  total_study_time?: number | null | undefined;
  completed_lessons?: number | null | undefined;
};

/**
 * findUserByEmail
 */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT u.user_id, u.email, u.password FROM users u WHERE u.email = ?",
    [email]
  );
  const r = rows as RowDataPacket[] & UserRow[];
  return (r[0] as UserRow) ?? null;
}

/**
 * getUserById
 * - user_profiles와 조인하여 프로필/통계 필드까지 반환
 * - MyPage에서 바로 사용할 수 있게 필드명을 DB 스키마에 맞춰 선택
 */
export async function getUserById(userId: number): Promise<UserRow | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
        u.user_id,
        u.email,
        u.created_at,
        u.updated_at,
        p.name,
        p.level,
        p.level_progress,
        p.profile_img,
        p.streak_count,
        p.total_study_time,
        p.completed_lessons
      FROM users u
      LEFT JOIN user_profiles p ON u.user_id = p.user_id
      WHERE u.user_id = ?`,
    [userId]
  );

  const r = rows as RowDataPacket[] & UserRow[];
  if (!r[0]) return null;

  // 명시적 타입 정리 및 null 처리
  const row = r[0] as UserRow;
  return {
    user_id: Number(row.user_id),
    email: String(row.email),
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
    name: row.name ?? null,
    level:
      (row.level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null) ?? null,
    level_progress:
      typeof row.level_progress === "number" ? row.level_progress : null,
    profile_img: row.profile_img ?? null,
    streak_count:
      typeof row.streak_count === "number" ? row.streak_count : null,
    total_study_time:
      typeof row.total_study_time === "number" ? row.total_study_time : null,
    completed_lessons:
      typeof row.completed_lessons === "number" ? row.completed_lessons : null,
  } as UserRow;
}

/**
 * createUserAndProfile
 */
export async function createUserAndProfile(user: {
  name: string;
  email: string;
  password: string; // hashed
}): Promise<{ user_id: number; email: string }> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userInsertResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [user.email, user.password]
    );

    const newUserId = userInsertResult.insertId;
    if (!newUserId) {
      throw new Error("Failed to create user");
    }

    // user_profiles 테이블의 기본값(DEFAULT)은 DB 스키마에서 처리되므로 최소 필드만 삽입
    await connection.execute(
      "INSERT INTO user_profiles (user_id, name) VALUES (?, ?)",
      [newUserId, user.name]
    );

    await connection.commit();
    return { user_id: Number(newUserId), email: user.email };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

/**
 * updateUserProfile
 */
export async function updateUserProfile(
  userId: number,
  payload: Partial<{
    name: string | null;
    profile_img: string | null;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
    level_progress: number | null;
    streak_count: number | null;
    total_study_time: number | null;
    completed_lessons: number | null;
  }>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if ("name" in payload) {
    fields.push("name = ?");
    values.push(payload.name);
  }
  if ("profile_img" in payload) {
    fields.push("profile_img = ?");
    values.push(payload.profile_img);
  }
  if ("level" in payload) {
    fields.push("level = ?");
    values.push(payload.level);
  }
  if ("level_progress" in payload) {
    fields.push("level_progress = ?");
    values.push(payload.level_progress);
  }

  if ("streak_count" in payload) {
    fields.push("streak_count = ?");
    values.push(payload.streak_count);
  }
  if ("total_study_time" in payload) {
    fields.push("total_study_time = ?");
    values.push(payload.total_study_time);
  }
  if ("completed_lessons" in payload) {
    fields.push("completed_lessons = ?");
    values.push(payload.completed_lessons);
  }

  if (fields.length === 0) return;

  values.push(userId);
  const sql = `UPDATE user_profiles SET ${fields.join(", ")} WHERE user_id = ?`;
  await pool.execute(sql, values);
}

/**
 * deleteUser
 */
export async function deleteUser(userId: number): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("DELETE FROM user_profiles WHERE user_id = ?", [
      userId,
    ]);
    await connection.execute("DELETE FROM users WHERE user_id = ?", [userId]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
