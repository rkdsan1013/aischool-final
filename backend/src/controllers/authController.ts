import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from "../services/authService";

// 회원가입
export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log("📥 [REGISTER 요청 바디]", req.body);

  try {
    const result = await registerUser(email, password);
    console.log("✅ [REGISTER 성공]", result);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("❌ [REGISTER 에러]", err.message);
    res.status(400).json({ message: err.message });
  }
}

// 로그인
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log("📥 [LOGIN 요청 바디]", req.body);

  try {
    const result = await loginUser(email, password, res);
    console.log("✅ [LOGIN 성공]", result);
    res.json(result);
  } catch (err: any) {
    console.error("❌ [LOGIN 에러]", err.message);
    res.status(400).json({ message: err.message });
  }
}

// 토큰 재발급
export async function refresh(req: Request, res: Response) {
  console.log("♻️ [REFRESH 요청]");
  try {
    const result = await refreshUserToken(req, res);
    console.log("✅ [REFRESH 성공]", result);
    res.json(result);
  } catch (err: any) {
    console.error("❌ [REFRESH 에러]", err.message);
    res.status(401).json({ message: err.message });
  }
}

// 로그아웃
export async function logout(req: Request, res: Response) {
  try {
    const result = await logoutUser(res);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
