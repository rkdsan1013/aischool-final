import { Router } from "express";
import { requireAuth } from "../middlewares/auth";

const router = Router();

/**
 * GET /api/users/me
 * 현재 로그인된 사용자 정보 반환 (requireAuth 미들웨어 필요)
 * 민감한 정보(password 등)은 제외해서 반환합니다.
 */
router.get("/me", requireAuth, (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { user_id, email, name, level } = req.user;
  // 필요시 추가 필드(예: level_progress 등)를 DB 조회 결과에서 가져와서 반환하세요.
  return res.json({
    id: user_id,
    email,
    name,
    level,
  });
});

export default router;
