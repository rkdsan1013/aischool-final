import axios from "axios";

// ✅ 응답 타입 정의
export interface LoginResponse {
  token: string;
  message: string;
}

export interface SignupResponse {
  message: string;
}

// ✅ axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:3000/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
});

// 로그인
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/login", { email, password });
  return res.data; // ✅ AxiosResponse 대신 data만 반환
}

// 회원가입
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<SignupResponse> {
  const res = await api.post<SignupResponse>("/register", {
    name,
    email,
    password,
  });
  return res.data;
}
