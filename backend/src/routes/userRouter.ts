// backend/src/routes/userRouter.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { getMyProfileHandler } from "../controllers/userController";

const router = Router();

/**
 * GET /api/user/me
 * - 인증 미들웨어(requireAuth) 통과 후 컨트롤러(getMyProfileHandler) 실행
 */
router.get("/me", requireAuth, getMyProfileHandler);

export default router;
