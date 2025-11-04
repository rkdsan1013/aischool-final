import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { Response, Request } from "express";

// 회원가입
export async function registerUser(email: string, password: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await createUser({ email, password: hashedPassword });

  return { message: "회원가입 성공" };
}

// 로그인
export async function loginUser(
  email: string,
  password: string,
  res: Response
) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("존재하지 않는 이메일입니다.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("비밀번호가 올바르지 않습니다.");
  }

  // Access / Refresh Token 발급
  const accessToken = await generateAccessToken({ id: user.user_id });
  const refreshToken = await generateRefreshToken({ id: user.user_id });

  // HttpOnly 쿠키 저장
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15분
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
  });

  return { message: "로그인 성공" };
}

// 토큰 재발급
export async function refreshUserToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

  try {
    const { payload } = await verifyRefreshToken(refreshToken);

    const userId = payload.id as number;

    // 새 Access Token 발급
    const newAccessToken = await generateAccessToken({
      id: userId,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15분
    });

    return { message: "토큰 재발급 성공" };
  } catch (err) {
    throw new Error("리프레시 토큰이 유효하지 않습니다.");
  }
}

// 로그아웃
export async function logoutUser(res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return { message: "로그아웃 성공" };
}
