// src/pages/MyPage.tsx
// cSpell:ignore CEFR
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Clock,
  Award,
  BarChart3,
  Trophy,
  User,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // 가상 useAuth 훅

export default function MyPage() {
  const navigate = useNavigate();
  // useAuth 훅 사용 (가정)
  const { profile, isLoading, logout, refreshProfile } = useAuth();

  useEffect(() => {
    // 로딩 중이 아니고 프로필이 없으면 홈으로 리다이렉트
    if (!isLoading && profile === null) {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

  useEffect(() => {
    // 페이지 진입 시 프로필 새로고침 (선택 사항)
    void refreshProfile();
  }, [refreshProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!profile) {
    return null; // 로딩 완료 후 프로필 없으면 렌더링 안 함 (리다이렉트 전)
  }

  // 통계 데이터 (nullish coalescing 사용)
  const stats = {
    streak: profile.streak_count ?? 0,
    totalStudyTime: profile.total_study_time ?? 0, // 분 단위라고 가정
    completedLessons: profile.completed_lessons ?? 0,
    currentLevel: profile.level ?? "A1",
    nextLevelProgress: profile.level_progress ?? 0, // 0-100%
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
    window.location.reload(); // 상태 완전 초기화를 위해 리로드
  };

  // 레벨 테스트 재응시 핸들러
  const handleRetakeTest = () => {
    navigate("/level-test"); // 레벨 테스트 페이지로 이동
  };

  // 총 학습 시간을 "시간 분"으로 변환 (예시)
  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}분`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}시간 ${m}분`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-rose-500 text-white p-4 sm:p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* 프로필 이미지 (예시: 첫 글자) */}
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl sm:text-4xl font-bold flex-shrink-0"
              aria-hidden
            >
              {profile.name ? profile.name.charAt(0) : profile.email.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1 tracking-tight truncate"
                title={profile.name ?? profile.email}
              >
                {profile.name ?? profile.email}
              </h1>
              <p className="text-white/80 text-sm sm:text-base truncate">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Level Card (CEFR) */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
                <span className="font-semibold text-sm sm:text-base">
                  언어 수준 (CEFR)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm font-semibold">
                {stats.currentLevel}
              </span>
            </div>

            <div
              className="w-full bg-white/20 h-2.5 rounded-full mb-2"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stats.nextLevelProgress}
            >
              <div
                className="h-2.5 bg-gradient-to-r from-gray-100 to-white rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, stats.nextLevelProgress)
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-white/80">
              <span>다음 레벨까지</span>
              <span className="font-semibold">{stats.nextLevelProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Stats Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-foreground">
              학습 현황
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              나의 학습 통계와 진행 상황을 확인하세요
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-card rounded-2xl border-2 border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-rose-500/30">
                  <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {stats.streak}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  연속 학습일
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border-2 border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-rose-500/30">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-xl sm:text-3xl font-bold text-foreground mb-1 whitespace-nowrap">
                  {formatStudyTime(stats.totalStudyTime)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  총 학습 시간
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border-2 border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-rose-500/30">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {stats.completedLessons}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  완료한 레슨
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Management Section */}
        <section>
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-foreground">
              계정 관리
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              프로필 설정과 학습 데이터를 관리하세요
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* 통계 */}
            <button
              className="border-2 border-gray-200 group w-full bg-card rounded-2xl p-4 sm:p-5 text-left cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-rose-200"
              onClick={() => navigate("/my/statistics")}
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-rose-500">
                      학습 통계
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      상세한 학습 기록을 확인하세요
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
              </div>
            </button>

            {/* 레벨 테스트 */}
            <button
              className="border-2 border-gray-200 group w-full bg-card rounded-2xl p-4 sm:p-5 text-left cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-rose-200"
              onClick={handleRetakeTest}
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-rose-500">
                      레벨 테스트
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      레벨을 다시 측정해보세요
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
              </div>
            </button>

            {/* 프로필 관리 */}
            <button
              className="border-2 border-gray-200 group w-full bg-card rounded-2xl p-4 sm:p-5 text-left cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-rose-200"
              onClick={() => navigate("/profile")}
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-rose-500">
                      프로필 관리
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      개인정보를 수정하세요
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
              </div>
            </button>
          </div>
        </section>

        {/* Logout */}
        <div className="mt-8 sm:mt-12">
          <button
            className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 border-2 border-gray-200 text-muted-foreground rounded-2xl font-semibold hover:border-rose-500 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 active:scale-[0.99]"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
