// backend/src/models/userModel.ts
import { pool } from "../config/db";
// ✅ ResultSetHeader 추가 (INSERT 결과에서 insertId를 얻기 위해)
import { RowDataPacket, ResultSetHeader } from "mysql2";

// User 타입 정의
export type User = {
  user_id: number;
  email: string;
  password: string;
};

// --- [신규] ---
// users와 user_profiles를 JOIN한 타입을 정의합니다.
export type UserWithProfile = User & {
  name: string;
  level: string;
  level_progress: number;
};
// --- [신규 완료] ---

// 이메일로 유저 찾기
export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<User[] & RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0] ?? null;
}

// --- [신규] ---
/**
 * ID로 유저 정보 + 프로필 정보(level 포함)를 함께 조회
 */
export async function findUserWithProfileById(
  userId: number
): Promise<UserWithProfile | null> {
  const [rows] = await pool.execute<UserWithProfile[] & RowDataPacket[]>(
    `SELECT u.user_id, u.email, u.password, p.name, p.level, p.level_progress
     FROM users u
     LEFT JOIN user_profiles p ON u.user_id = p.user_id
     WHERE u.user_id = ?`,
    [userId]
  );

  return rows[0] ?? null;
}
// --- [신규 완료] ---

// ✅ 유저 생성 및 프로필 생성 (트랜잭션)
export async function createUserAndProfile(user: {
  name: string; // name 추가
  email: string;
  password: string;
}): Promise<void> {
  // 1. 커넥션 풀에서 커넥션 가져오기
  const connection = await pool.getConnection();

  try {
    // 2. 트랜잭션 시작
    await connection.beginTransaction();

    // 3. users 테이블에 삽입
    const [userInsertResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [user.email, user.password]
    );

    // 4. 삽입된 user_id 가져오기
    const newUserId = userInsertResult.insertId;
    if (!newUserId) {
      throw new Error("유저 생성에 실패했습니다.");
    }

    // 5. user_profiles 테이블에 삽입 (user_id와 name 사용)
    //    (level, level_progress 등은 DB DDL에서 DEFAULT 값으로 자동 설정됨)
    await connection.execute(
      "INSERT INTO user_profiles (user_id, name) VALUES (?, ?)",
      [newUserId, user.name]
    );

    // 6. 트랜잭션 커밋
    await connection.commit();
    console.log(`[DB] User ${newUserId} 및 Profile 생성 완료`);
  } catch (error) {
    // 7. 에러 발생 시 롤백
    await connection.rollback();
    console.error("[DB] 회원가입 트랜잭션 롤백", error);
    // 서비스 레이어에서 처리할 수 있도록 에러 다시 던지기
    throw error;
  } finally {
    // 8. 커넥션 반환
    connection.release();
  }
}
