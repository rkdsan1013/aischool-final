import * as jose from "jose";

export interface TokenPayload extends jose.JWTPayload {
  id: number;
  email?: string;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export async function generateAccessToken(payload: TokenPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function generateRefreshToken(payload: Pick<TokenPayload, "id">) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);
}

export async function verifyAccessToken(token: string) {
  return await jose.jwtVerify(token, secret);
}

export async function verifyRefreshToken(token: string) {
  return await jose.jwtVerify(token, refreshSecret);
}
