// backend/src/models/userModel.ts
import { pool } from "../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// CEFR 레벨 타입 유니온
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// 기본 User 타입 (users 테이블)
export type User = {
  user_id: number;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
};

// 프로필이 포함된 User 타입 (JOIN 결과)
export type UserWithProfile = User & {
  name: string | null;
  level: CEFRLevel | null;
  level_progress: number | null;
  profile_img: string | null;
  streak_count: number | null;
  total_study_time: number | null;
  completed_lessons: number | null;
  // [신규] 점수 및 티어
  score: number | null;
  tier: string | null;
};

/**
 * 이메일로 유저 찾기 (Auth용)
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<User[] & RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0] ?? null;
}

/**
 * ID로 유저 정보 + 프로필 정보 조회 (score, tier 포함)
 */
export async function findUserWithProfileById(
  userId: number
): Promise<UserWithProfile | null> {
  const [rows] = await pool.execute<UserWithProfile[] & RowDataPacket[]>(
    `SELECT 
      u.user_id, u.email, u.password, u.created_at, u.updated_at,
      p.name, p.level, p.level_progress, p.profile_img,
      p.streak_count, p.total_study_time, p.completed_lessons,
      p.score, p.tier
     FROM users u
     LEFT JOIN user_profiles p ON u.user_id = p.user_id
     WHERE u.user_id = ?`,
    [userId]
  );

  return rows[0] ?? null;
}

/**
 * 유저 생성 및 프로필 생성 (트랜잭션)
 */
export async function createUserAndProfileTransaction(user: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user_id: number; email: string }> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. users 테이블 삽입
    const [userInsertResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [user.email, user.password]
    );

    const newUserId = userInsertResult.insertId;
    if (!newUserId) {
      throw new Error("유저 생성에 실패했습니다.");
    }

    // 2. user_profiles 테이블 삽입 (기본값 활용)
    await connection.execute(
      "INSERT INTO user_profiles (user_id, name) VALUES (?, ?)",
      [newUserId, user.name]
    );

    await connection.commit();
    return { user_id: newUserId, email: user.email };
  } catch (error) {
    await connection.rollback();
    console.error("[DB] 회원가입 트랜잭션 롤백", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 유저 프로필 업데이트 (동적 쿼리 생성)
 */
export async function updateUserProfileInDB(
  userId: number,
  payload: Partial<{
    name: string | null;
    profile_img: string | null;
    level: CEFRLevel | null;
    level_progress: number | null;
    streak_count: number | null;
    total_study_time: number | null;
    completed_lessons: number | null;
    score: number | null;
    tier: string | null;
  }>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  // Payload를 순회하며 쿼리 생성
  if (payload.name !== undefined) {
    fields.push("name = ?");
    values.push(payload.name);
  }
  if (payload.profile_img !== undefined) {
    fields.push("profile_img = ?");
    values.push(payload.profile_img);
  }
  if (payload.level !== undefined) {
    fields.push("level = ?");
    values.push(payload.level);
  }
  if (payload.level_progress !== undefined) {
    fields.push("level_progress = ?");
    values.push(payload.level_progress);
  }
  if (payload.streak_count !== undefined) {
    fields.push("streak_count = ?");
    values.push(payload.streak_count);
  }
  if (payload.total_study_time !== undefined) {
    fields.push("total_study_time = ?");
    values.push(payload.total_study_time);
  }
  if (payload.completed_lessons !== undefined) {
    fields.push("completed_lessons = ?");
    values.push(payload.completed_lessons);
  }
  if (payload.score !== undefined) {
    fields.push("score = ?");
    values.push(payload.score);
  }
  if (payload.tier !== undefined) {
    fields.push("tier = ?");
    values.push(payload.tier);
  }

  // 변경할 필드가 없으면 종료
  if (fields.length === 0) return;

  values.push(userId);
  const sql = `UPDATE user_profiles SET ${fields.join(", ")} WHERE user_id = ?`;

  await pool.execute(sql, values);
}

/**
 * 유저 패스워드 업데이트
 */
export async function updateUserPasswordInDB(
  userId: number,
  hashedPassword: string
): Promise<void> {
  await pool.execute("UPDATE users SET password = ? WHERE user_id = ?", [
    hashedPassword,
    userId,
  ]);
}

/**
 * 유저 삭제 (트랜잭션)
 */
export async function deleteUserTransaction(userId: number): Promise<void> {
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
