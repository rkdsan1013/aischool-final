import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

// ✅ AuthPage 안에서 헤더를 내부 컴포넌트로 정의
function Header({
  tab,
  setTab,
}: {
  tab: "login" | "signup";
  setTab: (t: "login" | "signup") => void;
}) {
  return (
    <div className="flex flex-col mb-6 w-full padding-full">
      {/* 로고/타이틀 */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-rose-500 text-center">Blabla</h1>
      </div>

      {/* 탭 버튼 */}
      <div className="flex justify-center  mb-6">
        <button
          onClick={() => setTab("login")}
          className={`w-full pb-1 border-b-2 text-center text-lg font-medium ${
            tab === "login"
              ? "border-rose-500 text-rose-500"
              : "border-transparent text-gray-500"
          }`}
        >
          로그인
        </button>
        <button
          onClick={() => setTab("signup")}
          className={`w-full pb-1 border-b-2 text-center text-lg font-medium ${
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError(tab === "login" ? "로그인 실패 예시" : "회원가입 실패 예시");
    }, 1000);
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

      {/* 헤더 (로고 + 탭) */}
      <Header tab={tab} setTab={setTab} />

      {/* 폼 */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 min-h-[400px]"
      >
        {tab === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={isLoading}
          />
        </div>

        {tab === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
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
