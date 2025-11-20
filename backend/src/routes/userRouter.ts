// backend/src/routes/userRouter.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  getMyProfileHandler,
  updateMyProfileHandler,
  deleteMyAccountHandler,
  changePasswordHandler, // [신규] 비밀번호 변경 컨트롤러 추가
} from "../controllers/userController";

const router = Router();

/**
 * GET /api/user/me
 * - 인증 미들웨어(requireAuth) 통과 후 컨트롤러(getMyProfileHandler) 실행
 */
router.get("/me", requireAuth, getMyProfileHandler);

/**
 * PUT /api/user/me
 * - 사용자 프로필 업데이트
 */
router.put("/me", requireAuth, updateMyProfileHandler);

/**
 * PUT /api/user/me/password
 * - 사용자 비밀번호 변경
 */
router.put("/me/password", requireAuth, changePasswordHandler);

/**
 * DELETE /api/user/me
 * - 사용자 계정 삭제
 */
router.delete("/me", requireAuth, deleteMyAccountHandler);

export default router;
