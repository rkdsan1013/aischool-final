import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser } from "../services/authService";

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

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  console.log("📥 [LOGIN 요청 바디]", req.body);

  try {
    // ✅ res를 함께 전달해야 함
    const result = await loginUser(email, password, res);
    console.log("✅ [LOGIN 성공]", result);
    res.json(result);
  } catch (err: any) {
    console.error("❌ [LOGIN 에러]", err.message);
    res.status(400).json({ message: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const result = await logoutUser(res);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
