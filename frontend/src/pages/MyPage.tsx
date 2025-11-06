import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import {
  TrendingUp,
  Flame,
  Clock,
  Award,
  BarChart3,
  Trophy, // ✅ 레벨 카드에 사용
  User,
  ChevronRight,
} from "lucide-react";

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
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-rose-500 text-white p-4 sm:p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1 tracking-tight truncate">
                {user.name}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">{user.email}</p>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              {/* ✅ 이모지(🏆)를 Lucide 아이콘으로 변경 */}
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white/90" />
                <span className="font-semibold text-sm sm:text-base">
                  현재 레벨
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-white/20 text-white text-xs sm:text-sm">
                {stats.currentLevel}
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded mb-2">
              <div
                className="h-2 bg-gradient-to-r from-gray-00 to-white rounded"
                style={{ width: `${stats.nextLevelProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/80">
              <span>다음 레벨까지</span>
              <span className="font-semibold">{stats.nextLevelProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            학습 현황
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            나의 학습 통계와 진행 상황을 확인하세요
          </p>
        </div>

        {/* ✅ hover: shadow: active: sm:hover: 등 호버/전환 효과 제거 */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.streak}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                연속 학습일
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.totalStudyTime}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                총 학습 시간
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.completedLessons}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                완료한 레슨
              </p>
            </div>
          </div>
        </div>

        {/* ✅ '이번 주 학습 목표' 카드 호버 효과 제거 */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-md">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                이번 주 학습 목표
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                주 {stats.weeklyGoal}일 학습 목표
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold text-rose-500">
                {stats.weeklyProgress}/{stats.weeklyGoal}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">일</p>
            </div>
          </div>

          <div className="relative w-full h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-rose-500 rounded-full transition-all duration-500"
              style={{
                width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base">
            <p className="text-gray-600">
              {stats.weeklyGoal - stats.weeklyProgress > 0
                ? `${
                    stats.weeklyGoal - stats.weeklyProgress
                  }일 더 학습하면 목표 달성!`
                : "🎉 이번 주 목표 달성! 대단해요!"}
            </p>
            <p className="font-semibold text-rose-500">
              {Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%
            </p>
          </div>
        </div>

        {/* Account Management Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            계정 관리
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            프로필 설정과 학습 데이터를 관리하세요
          </p>
        </div>

        <div className="space-y-2">
          {/* 학습 통계 */}
          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition group"
            onClick={() => navigate("/my/statistics")}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  학습 통계
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  상세한 학습 기록을 확인하세요
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          {/* 레벨 테스트 */}
          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition group"
            onClick={handleRetakeTest}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  레벨 테스트
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  레벨을 다시 측정해보세요
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          {/* 프로필 관리 */}
          <div
            className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition group mb-2"
            onClick={() => navigate("/profile")}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  프로필 관리
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  개인정보를 수정하세요
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-3">
          <button
            className=" w-full h-12 border border-rose-500 text-rose-500 rounded-xl font-semibold hover:bg-rose-50 transition"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
