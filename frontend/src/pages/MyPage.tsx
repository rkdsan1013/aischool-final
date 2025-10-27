import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>({
    name: "홍길동",
    email: "test@test.com",
  });
  const [isLoading] = useState(false); // setter 제거

  const [stats] = useState({
    totalStudyTime: 245,
    streak: 7,
    completedLessons: 42,
    currentLevel: "B1",
    nextLevelProgress: 65,
    weeklyGoal: 5,
    weeklyProgress: 3,
  }); // setter 제거

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout(); // 백엔드 로그아웃 API 호출
      setUser(null); // 상태 초기화
      navigate("/"); // 홈으로 이동
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleRetakeTest = () => {
    navigate("/level-test");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-rose-500 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 tracking-tight">
                {user.name}
              </h1>
              <p className="text-white/80 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                🏆 <span className="font-semibold">현재 레벨</span>
              </div>
              <span className="px-2 py-1 rounded bg-white/20 text-white text-sm">
                {stats.currentLevel}
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded mb-2">
              <div
                className="bg-white h-2 rounded transition-all"
                style={{ width: `${stats.nextLevelProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/80">
              <span>다음 레벨까지</span>
              <span className="font-semibold">{stats.nextLevelProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-xl p-4 text-center hover:shadow-lg transition">
            <div className="text-rose-500 text-2xl mb-1">🔥</div>
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-sm text-gray-500">연속 학습</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center hover:shadow-lg transition">
            <div className="text-rose-400 text-2xl mb-1">⏰</div>
            <p className="text-2xl font-bold">{stats.totalStudyTime}</p>
            <p className="text-sm text-gray-500">총 학습 시간</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center hover:shadow-lg transition">
            <div className="text-rose-600 text-2xl mb-1">🏅</div>
            <p className="text-2xl font-bold">{stats.completedLessons}</p>
            <p className="text-sm text-gray-500">완료한 레슨</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4 text-center hover:shadow-lg transition">
            <div className="text-rose-500 text-2xl mb-1">🎯</div>
            <p className="text-2xl font-bold">
              {stats.weeklyProgress}/{stats.weeklyGoal}
            </p>
            <p className="text-sm text-gray-500">주간 목표</p>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-bold mb-1 text-rose-600">
            📅 이번 주 학습 목표
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            주 {stats.weeklyGoal}일 학습 목표
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>진행도</span>
              <span className="font-semibold text-rose-600">
                {stats.weeklyProgress}/{stats.weeklyGoal}일
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-rose-500 h-2 rounded transition-all"
                style={{
                  width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {stats.weeklyGoal - stats.weeklyProgress}일 더 학습하면 목표 달성!
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate("/my/statistics")}
          >
            <div className="flex items-center gap-3">
              <span className="text-rose-500">📊</span>
              <div>
                <p className="font-semibold">학습 통계</p>
                <p className="text-sm text-gray-500">
                  상세한 학습 기록을 확인하세요
                </p>
              </div>
            </div>
            ➡️
          </div>

          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
            onClick={handleRetakeTest}
          >
            <div className="flex items-center gap-3">
              <span className="text-rose-400">🏆</span>
              <div>
                <p className="font-semibold">레벨 테스트 다시하기</p>
                <p className="text-sm text-gray-500">
                  실력 향상을 확인해보세요
                </p>
              </div>
            </div>
            ➡️
          </div>

          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate("/my/settings")}
          >
            <div className="flex items-center gap-3">
              <span className="text-rose-600">⚙️</span>
              <div>
                <p className="font-semibold">설정</p>
                <p className="text-sm text-gray-500">알림, 목표 설정 등</p>
              </div>
            </div>
            ➡️
          </div>

          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate("/my/profile")}
          >
            <div className="flex items-center gap-3">
              <span className="text-rose-500">👤</span>
              <div>
                <p className="font-semibold">프로필 관리</p>
                <p className="text-sm text-gray-500">개인정보 수정</p>
              </div>
            </div>
            ➡️
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="w-full h-12 border border-rose-500 text-rose-500 rounded-xl font-semibold hover:bg-rose-50 transition"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
