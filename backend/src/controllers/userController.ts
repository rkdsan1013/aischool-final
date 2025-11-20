// backend/src/controllers/userController.ts
import { Request, Response } from "express";
import { getUserById, updateUserProfile } from "../services/userService";

/**
 * GET /api/user/me
 * 현재 로그인한 사용자의 프로필 조회
 */
export async function getMyProfileHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userProfile = await getUserById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    // 필요한 필드만 깔끔하게 반환
    return res.json({
      user_id: userProfile.user_id,
      email: userProfile.email,
      name: userProfile.name,
      level: userProfile.level,
      level_progress: userProfile.level_progress,
      streak_count: userProfile.streak_count,
      total_study_time: userProfile.total_study_time,
      completed_lessons: userProfile.completed_lessons,
      profile_img: userProfile.profile_img,
      score: userProfile.score,
      tier: userProfile.tier,
    });
  } catch (err) {
    console.error("[USER CONTROLLER] getMyProfile error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * PUT /api/user/me
 * 현재 로그인한 사용자의 프로필 수정
 */
export async function updateMyProfileHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 업데이트 가능한 필드만 추출
    const { name, profile_img } = req.body;

    await updateUserProfile(userId, { name, profile_img });

    return res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("[USER CONTROLLER] updateMyProfile error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
