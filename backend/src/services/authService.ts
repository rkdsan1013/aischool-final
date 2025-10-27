import bcrypt from "bcrypt";
import { createUser, findUserByEmail } from "../models/userModel";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { Response } from "express";

// 회원가입
export async function registerUser(email: string, password: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("이미 존재하는 이메일입니다.");

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
  if (!user) throw new Error("존재하지 않는 이메일입니다.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("비밀번호가 올바르지 않습니다.");

  // Access / Refresh Token 발급
  const accessToken = await generateAccessToken({
    id: user.user_id,
    email: user.email,
  });
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
