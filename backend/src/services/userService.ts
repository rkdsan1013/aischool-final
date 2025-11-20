// backend/src/services/userService.ts
import {
  findUserByEmail as findUserByEmailModel,
  findUserWithProfileById,
  createUserAndProfileTransaction,
  updateUserProfileInDB,
  deleteUserTransaction,
  updateUserPasswordInDB,
} from "../models/userModel";
import bcrypt from "bcrypt";

/**
 * 서비스 레이어의 User 타입
 * (DB Model 타입과 거의 같지만, 비즈니스 로직에 맞게 가공될 수 있음)
 */
export type UserRow = {
  user_id: number;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
  name?: string | null;
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  level_progress?: number | null;
  profile_img?: string | null;
  streak_count?: number | null;
  total_study_time?: number | null;
  completed_lessons?: number | null;
  score?: number | null;
  tier?: string | null;
};

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const user = await findUserByEmailModel(email);
  if (!user) return null;
  return {
    user_id: user.user_id,
    email: user.email,
    ...(typeof user.password === "string" ? { password: user.password } : {}),
  };
}

export async function getUserById(userId: number): Promise<UserRow | null> {
  const row = await findUserWithProfileById(userId);
  if (!row) return null;

  const result: UserRow = {
    user_id: row.user_id,
    email: row.email,
    // created_at / updated_at는 존재할 때만 추가 (exactOptionalPropertyTypes 대응)
    ...(typeof row.created_at === "string"
      ? { created_at: row.created_at }
      : {}),
    ...(typeof row.updated_at === "string"
      ? { updated_at: row.updated_at }
      : {}),
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

  return result;
}

/**
 * 비밀번호 변경을 위해 패스워드까지 포함한 조회가 필요할 때 사용
 * - exactOptionalPropertyTypes: true 환경에서 password는 존재할 때만 추가
 */
export async function getUserWithPasswordById(
  userId: number
): Promise<{ user_id: number; email: string; password?: string } | null> {
  const row = await findUserWithProfileById(userId);
  if (!row) return null;

  const result: { user_id: number; email: string; password?: string } = {
    user_id: row.user_id,
    email: row.email,
  };

  if (typeof row.password === "string") {
    result.password = row.password;
  }

  return result;
}

export async function createUserAndProfile(user: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user_id: number; email: string }> {
  return await createUserAndProfileTransaction(user);
}

/**
 * 전달된 payload에서 undefined 필드를 제거하여 부분 업데이트만 수행되도록 보장
 */
function sanitizePayload<T extends Record<string, unknown>>(
  payload: T
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(payload) as (keyof T)[]) {
    const value = payload[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
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
  const clean = sanitizePayload(payload);
  await updateUserProfileInDB(userId, clean);
}

export async function deleteUser(userId: number): Promise<void> {
  await deleteUserTransaction(userId);
}

/**
 * 컨트롤러에서 명확한 의미 전달을 위해 deleteUserById 별칭 제공
 */
export async function deleteUserById(userId: number): Promise<void> {
  await deleteUserTransaction(userId);
}

/**
 * 비밀번호 변경 서비스
 * - 현재 비밀번호 검증 후, 새 비밀번호로 업데이트
 */
export async function changeUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getUserWithPasswordById(userId);
  if (!user || !user.password) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("Current password incorrect");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateUserPasswordInDB(userId, hashed);
}
