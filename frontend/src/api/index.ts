import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { navigate } from "../routes/navigate"; // ✅ 전역 navigate 헬퍼 사용

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

// 3. Axios 인스턴스 생성 (쿠키 기반 인증)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ HttpOnly 쿠키 자동 포함
});

// 4. 응답 인터셉터 (401 → refresh 재시도)
let isRefreshing = false;
let refreshSubscribers: Array<(success: boolean) => void> = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((success) => {
            if (success) {
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        onRefreshed(true);
        return apiClient(originalRequest);
      } catch (err) {
        onRefreshed(false);
        // ✅ refresh 실패 → React Router navigate 사용
        navigate("/");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 5. 표준화된 API 오류 처리 헬퍼
export function handleApiError(
  error: unknown,
  context: string = "API 요청"
): never {
  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { message?: string })
      ?.message;
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
