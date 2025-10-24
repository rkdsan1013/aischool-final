import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as loginService,
  signup as signupService,
} from "../services/authService";
import { AxiosError } from "axios";

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
    />
  );
}

function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-rose-500 px-4 py-3 font-medium text-white hover:bg-rose-600 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Header({
  tab,
  setTab,
}: {
  tab: "login" | "signup";
  setTab: (t: "login" | "signup") => void;
}) {
  return (
    <div className="flex flex-col mb-6 w-full">
      {/* 로고 */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-rose-500 text-center">Blabla</h1>
      </div>

      {/* 탭 버튼 */}
      <div className="flex justify-center mb-6 gap-6">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`pb-1 border-b-2 text-lg font-medium ${
            tab === "login"
              ? "border-rose-500 text-rose-500"
              : "border-transparent text-gray-500"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`pb-1 border-b-2 text-lg font-medium ${
            tab === "signup"
              ? "border-rose-500 text-rose-500"
              : "border-transparent text-gray-500"
          }`}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ 로그인 처리 함수
  const handleLogin = async () => {
    try {
      const data = await loginService(loginEmail, loginPassword);
      localStorage.setItem("token", data.token); // ✅ 토큰 저장
      navigate("/my");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 회원가입 처리 함수
  const handleSignup = async () => {
    try {
      await signupService(signupName, signupEmail, signupPassword);
      alert("회원가입 성공! 로그인 해주세요.");
      setTab("login");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || "서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (tab === "login") {
      if (!loginEmail || !loginPassword) {
        setError("이메일과 비밀번호를 입력하세요.");
        setIsLoading(false);
        return;
      }
      await handleLogin();
    } else {
      if (
        !signupName ||
        !signupEmail ||
        !signupPassword ||
        !signupConfirmPassword
      ) {
        setError("모든 필드를 입력하세요.");
        setIsLoading(false);
        return;
      }
      if (signupPassword !== signupConfirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return;
      }
      await handleSignup();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-white p-6">
      {/* 우측 상단 X 버튼 */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
      >
        ×
      </button>

      {/* 헤더 */}
      <Header tab={tab} setTab={setTab} />

      {/* 폼 */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 min-h-[400px]"
      >
        {tab === "login" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="loginEmail">이메일</Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="example@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginPassword">비밀번호</Label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="비밀번호"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="signupName">이름</Label>
              <Input
                id="signupName"
                type="text"
                placeholder="홍길동"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signupEmail">이메일</Label>
              <Input
                id="signupEmail"
                type="email"
                placeholder="example@email.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signupPassword">비밀번호</Label>
              <Input
                id="signupPassword"
                type="password"
                placeholder="비밀번호"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signupConfirmPassword">비밀번호 확인</Label>
              <Input
                id="signupConfirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? tab === "login"
              ? "로그인 중..."
              : "가입 중..."
            : tab === "login"
            ? "로그인"
            : "회원가입"}
        </Button>
      </form>
    </div>
  );
}
