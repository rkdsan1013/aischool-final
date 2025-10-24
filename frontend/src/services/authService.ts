// src/services/authService.ts
import { apiClient, handleApiError } from "../api";

// 응답 타입 정의
export interface LoginResponse {
  token: string;
  message: string;
}

export interface SignupResponse {
  message: string;
}

// 로그인
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    // apiClient의 baseURL이 '.../api'이므로, 엔드포인트는 '/auth/login'이 됩니다.
    const res = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    handleApiError(error, "로그인");
  }
}

// 회원가입
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  try {
    const res = await apiClient.post<SignupResponse>("/auth/register", {
      name,
      email,
      password,
    });
    return res.data;
  } catch (error) {
    handleApiError(error, "회원가입");
  }
}
