import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log("📥 [REGISTER 요청 바디]", req.body); // ✅ 요청 바디 로그

  try {
    const result = await registerUser(email, password); // ✅ name 제거
    console.log("✅ [REGISTER 성공]", result); // ✅ 성공 로그
    res.status(201).json(result);
  } catch (err: any) {
    console.error("❌ [REGISTER 에러]", err.message); // ✅ 에러 로그
    res.status(400).json({ message: err.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log("📥 [LOGIN 요청 바디]", req.body); // ✅ 요청 바디 로그

  try {
    const result = await loginUser(email, password);
    console.log("✅ [LOGIN 성공]", result); // ✅ 성공 로그
    res.json(result);
  } catch (err: any) {
    console.error("❌ [LOGIN 에러]", err.message); // ✅ 에러 로그
    res.status(400).json({ message: err.message });
  }
}
