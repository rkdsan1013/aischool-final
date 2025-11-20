// backend/src/models/trainingModel.ts
import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";
import { getTierByScore } from "../utils/gamification";

/**
 * 사용자 점수 업데이트 및 티어 갱신 (트랜잭션)
 * 1. 현재 점수에 획득 점수 추가
 * 2. 업데이트된 점수 조회
 * 3. 점수에 맞는 티어 계산
 * 4. 티어 업데이트 (변동 시)
 */
export async function updateUserScoreAndTier(
  userId: number,
  pointsToAdd: number
): Promise<{ newScore: number; newTier: string }> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. 점수 업데이트 (Atomic Update)
    await connection.execute(
      `UPDATE user_profiles SET score = score + ? WHERE user_id = ?`,
      [pointsToAdd, userId]
    );

    // 2. 업데이트된 최신 점수 조회
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT score FROM user_profiles WHERE user_id = ?`,
      [userId]
    );

    if (!rows[0]) {
      throw new Error("User profile not found for scoring");
    }

    const currentScore = rows[0].score as number;

    // 3. 새로운 티어 계산
    const newTier = getTierByScore(currentScore);

    // 4. 티어 업데이트 (항상 최신 상태로 유지)
    await connection.execute(
      `UPDATE user_profiles SET tier = ? WHERE user_id = ?`,
      [newTier, userId]
    );

    await connection.commit();

    return { newScore: currentScore, newTier };
  } catch (err) {
    await connection.rollback();
    console.error("[TrainingModel] Score update failed:", err);
    throw err;
  } finally {
    connection.release();
  }
}
