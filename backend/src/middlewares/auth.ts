import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { getUserById } from "../services/userService";

declare module "express-serve-static-core" {
  interface Request {
    user?: { user_id: number; email?: string; name?: string; level?: string };
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
    req.user = {
      user_id: user.user_id,
      email: user.email,
      name: (user as any).name ?? undefined,
      level: (user as any).level ?? undefined,
    };

    next();
  } catch (err) {
    console.error("[auth.requireAuth] token verify error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
