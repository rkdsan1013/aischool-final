// backend/src/services/userService.ts
import {
  findUserByEmail as findUserByEmailModel,
  findUserWithProfileById,
  createUserAndProfileTransaction,
  updateUserProfileInDB,
  deleteUserTransaction,
} from "../models/userModel";

/**
 * 서비스 레이어의 User 타입
 * (DB Model 타입과 거의 같지만, 비즈니스 로직에 맞게 가공될 수 있음)
 */
export type UserRow = {
  user_id: number;
  email: string;
  password?: string | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
  name?: string | null | undefined;
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null | undefined;
  level_progress?: number | null | undefined;
  profile_img?: string | null | undefined;
  streak_count?: number | null | undefined;
  total_study_time?: number | null | undefined;
  completed_lessons?: number | null | undefined;
  score?: number | null | undefined;
  tier?: string | null | undefined;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const user = await findUserByEmailModel(email);
  if (!user) return null;
  return {
    user_id: user.user_id,
    email: user.email,
    password: user.password,
  };
}

export async function getUserById(userId: number): Promise<UserRow | null> {
  const row = await findUserWithProfileById(userId);
  if (!row) return null;

  return {
    user_id: row.user_id,
    email: row.email,
    created_at: row.created_at,
    updated_at: row.updated_at,
    name: row.name,
    level: row.level,
    level_progress: row.level_progress,
    profile_img: row.profile_img,
    streak_count: row.streak_count,
    total_study_time: row.total_study_time,
    completed_lessons: row.completed_lessons,
    score: row.score ?? 0,
    tier: row.tier ?? "Bronze",
  };
}

export async function createUserAndProfile(user: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user_id: number; email: string }> {
  return await createUserAndProfileTransaction(user);
}

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
    score: number | null;
    tier: string | null;
  }>
): Promise<void> {
  await updateUserProfileInDB(userId, payload);
}

export async function deleteUser(userId: number): Promise<void> {
  await deleteUserTransaction(userId);
}
