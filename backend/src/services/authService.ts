import bcrypt from "bcrypt";
import * as jose from "jose";
import { createUser, findUserByEmail, User } from "../models/userModel";

// 회원가입
export async function registerUser(email: string, password: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("이미 존재하는 이메일입니다.");

  const hashedPassword = await bcrypt.hash(password, 10);
  await createUser({ email, password: hashedPassword });
  return { message: "회원가입 성공" };
}

// 로그인
export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("존재하지 않는 이메일입니다.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("비밀번호가 올바르지 않습니다.");

  // jose는 Uint8Array 키를 사용해야 함
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  // JWT 생성
  const token = await new jose.SignJWT({ id: user.user_id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return { message: "로그인 성공", token };
}
