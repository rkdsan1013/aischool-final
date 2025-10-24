// src/api/index.ts
import axios from "axios";

// 1. 표준화된 서비스 오류
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

// 2. API 기본 URL 설정 (Vite 환경 변수 사용)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// 3. Axios 인스턴스 생성 및 export
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 4. API 요청 인터셉터 (모든 요청에 인증 토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 5. 표준화된 API 오류 처리 헬퍼
export function handleApiError(
  error: unknown,
  context: string = "API 요청"
): never {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === "string") {
      throw new ServiceError(serverMessage);
    }
    throw new ServiceError(
      error.message || `${context} 중 오류가 발생했습니다.`
    );
  }

  if (error instanceof Error) {
    throw new ServiceError(error.message);
  }

  throw new ServiceError(`알 수 없는 오류가 발생했습니다. (${context})`);
}
