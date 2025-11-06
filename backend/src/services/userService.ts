import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * DB에서 사용하는 유저/프로필 타입 정의
 */
export type UserRow = {
  user_id: number;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;

  // profile fields (joined)
  name?: string | null;
  level?: string | null;
  level_progress?: number | null;
  profile_img?: string | null;

  // stats stored in user_profiles per current schema
  streak_count?: number | null;
  total_study_time?: number | null;
  completed_lessons?: number | null;
  weekly_goal?: number | null;
  weekly_progress?: number | null;
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
 * - 현재 DB 스키마(user_profiles에 통계 컬럼 포함)에 맞춰 JOIN 쿼리 수정
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
  return (r[0] as UserRow) ?? null;
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

    // user_profiles 테이블의 기본값(DEFAULT)은 DB 스키마에서 처리되므로
    // 최소 필드만 삽입
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
    level: string | null;
    level_progress: number | null;
    // stats can also be updated here if needed
    streak_count: number | null;
    total_study_time: number | null;
    completed_lessons: number | null;
    weekly_goal: number | null;
    weekly_progress: number | null;
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

  // stats fields (optional)
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
  if ("weekly_goal" in payload) {
    fields.push("weekly_goal = ?");
    values.push(payload.weekly_goal);
  }
  if ("weekly_progress" in payload) {
    fields.push("weekly_progress = ?");
    values.push(payload.weekly_progress);
  }

  if (fields.length === 0) return;

  values.push(userId);
  const sql = `UPDATE user_profiles SET ${fields.join(", ")} WHERE user_id = ?`;
  await pool.execute(sql, values);
}

/**
 * deleteUser
 * - 현재 스키마에 맞춰 user_profiles / users만 삭제
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
