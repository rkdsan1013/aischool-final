import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Clock,
  Award,
  BarChart3,
  Trophy,
  User,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center mb-3 sm:mb-4 shadow-md">
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-gray-600 font-medium">{label}</p>
    </div>
  </div>
);

const NavigateRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ icon, title, subtitle, onClick }) => (
  <div
    className="bg-white shadow rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-lg transition group"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyPress={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        onClick();
      }
    }}
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
  </div>
);

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthLoading, logout } = useAuth();
  const { profile, isProfileLoading } = useProfile();

  const isLoading = isAuthLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading && profile === null) {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const stats = {
    streak: profile.streak_count ?? 0,
    totalStudyTime: profile.total_study_time ?? 0,
    completedLessons: profile.completed_lessons ?? 0,
    currentLevel: profile.level ?? "A1",
    nextLevelProgress: profile.level_progress ?? 0,
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("[MyPage] logout failed:", err);
    } finally {
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  const handleRetakeTest = () => navigate("/level-test");

  // 프로필 관리 클릭 시 MyPageProfile 컴포넌트로 이동 (/profile 경로)
  const handleOpenProfile = () => navigate("/my/profile");

  // 히스토리로 이동
  const handleOpenHistory = () => navigate("/my/history");

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="bg-rose-500 text-white p-4 sm:p-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl sm:text-3xl font-bold"
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
              <p className="text-white/80 text-xs sm:text-sm">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white/90" />
                <span className="font-semibold text-sm sm:text-base">
                  언어 수준 (CEFR)
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-white/20 text-white text-xs sm:text-sm">
                {stats.currentLevel}
              </span>
            </div>

            <div
              className="w-full bg-white/20 h-2 rounded mb-2"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={stats.nextLevelProgress}
            >
              <div
                className="h-2 bg-gradient-to-r from-gray-100 to-white rounded"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, stats.nextLevelProgress)
                  )}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/80">
              <span>다음 레벨까지</span>
              <span className="font-semibold">{stats.nextLevelProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            학습 현황
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            나의 학습 통계와 진행 상황을 확인하세요
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={<Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            value={stats.streak}
            label="연속 학습일"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            value={stats.totalStudyTime}
            label="총 학습 시간"
          />
          <StatCard
            icon={<Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            value={stats.completedLessons}
            label="완료한 레슨"
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            계정 관리
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            프로필 설정과 학습 데이터를 관리하세요
          </p>
        </div>

        <div className="space-y-2">
          <NavigateRow
            icon={<BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            title="히스토리"
            subtitle="상세한 학습 기록을 확인하세요"
            onClick={handleOpenHistory}
          />

          <NavigateRow
            icon={<Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            title="레벨 테스트"
            subtitle="레벨을 다시 측정해보세요"
            onClick={handleRetakeTest}
          />

          <NavigateRow
            icon={<User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />}
            title="프로필 관리"
            subtitle="개인정보를 수정하세요"
            onClick={handleOpenProfile}
          />
        </div>

        <div className="mt-3">
          <button
            className="w-full h-12 border border-rose-500 text-rose-500 rounded-xl font-semibold hover:bg-rose-50 transition"
            onClick={handleLogout}
            type="button"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
