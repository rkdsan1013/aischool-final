// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { getUserById } from "../services/userService";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      user_id: number;
      // --- [수정됨] ---
      // exactOptionalPropertyTypes: true 규칙을 통과하기 위해
      // 옵셔널 타입에 | undefined를 추가합니다.
      email?: string | undefined;
      name?: string | undefined;
      level?: string | undefined;
      level_progress?: number | undefined;
      // --- [수정 완료] ---
    };
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 쿠키 이름은 authService와 일치해야 합니다 (accessToken)
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // jose.jwtVerify 결과 구조: { payload, protectedHeader }
    const { payload } = await verifyAccessToken(token);
    const userId = (payload as any)?.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // DB에서 사용자 조회
    const user = await getUserById(Number(userId));
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // req.user에 노출 가능한 최소 정보만 저장
    // (이제 이 할당은 declare module의 타입과 일치합니다)
    req.user = {
      user_id: user.user_id,
      email: user.email,
      name: user.name ?? undefined,
      level: user.level ?? undefined,
      level_progress: user.level_progress ?? 50,
    };

    next();
  } catch (err) {
    console.error("[auth.requireAuth] token verify error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
