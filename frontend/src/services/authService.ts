import { apiClient, handleApiError } from "../api";

// 응답 타입 정의
export interface LoginResponse {
  message: string;
}

export interface SignupResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

// 로그인
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
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
// 로그아웃
export async function logout(): Promise<LogoutResponse> {
  try {
    const res = await apiClient.post<LogoutResponse>("/auth/logout", {});
    return res.data;
  } catch (error) {
    handleApiError(error, "로그아웃");
  }
}
