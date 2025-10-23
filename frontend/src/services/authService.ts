import axios from "axios";

const API_URL = "http://localhost:3000/api/auth"; // ✅ /auth 붙여야 함

// 로그인
export const login = (email: string, password: string) =>
  axios.post(`${API_URL}/login`, { email, password });

// 회원가입
export const signup = (name: string, email: string, password: string) =>
  axios.post(`${API_URL}/register`, { name, email, password }); // ✅ register로 수정
