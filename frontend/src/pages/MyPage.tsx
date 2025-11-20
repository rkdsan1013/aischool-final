import React, { useEffect, useMemo } from "react";
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

// 출석 그리드 (모바일 퍼스트, 전처럼 작은 칸 유지 + 회색은 gray-200)
// 6개월 기준으로 잡초(칸) 수 확대
const AttendanceGrid: React.FC<{
  data: { date: string; attended: boolean; count?: number }[];
}> = ({ data }) => {
  const weeks = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (sorted.length === 0) return [];
    const start = new Date(sorted[0].date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);

    // 6개월 ≈ 26주로 확장 (가로를 꽉 채워 보이도록 컬럼 수 증가)
    const maxWeeks = 26;
    const grid: {
      date: Date;
      item?: { date: string; attended: boolean; count?: number };
    }[][] = [];
    const cursor = new Date(start);

    for (let w = 0; w < maxWeeks; w++) {
      const week: {
        date: Date;
        item?: { date: string; attended: boolean; count?: number };
      }[] = [];
      for (let d = 0; d < 7; d++) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, "0");
        const dd = String(cursor.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${dd}`;
        const found = sorted.find((x) => x.date === dateStr);
        week.push({ date: new Date(cursor), item: found });
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(week);
    }
    return grid;
  }, [data]);

  const getColor = (item?: { attended: boolean; count?: number }) => {
    if (!item || !item.attended) return "bg-gray-200";
    const c = item.count ?? 1;
    if (c >= 4) return "bg-rose-700";
    if (c === 3) return "bg-rose-600";
    if (c === 2) return "bg-rose-500";
    return "bg-rose-400";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-500" />
          <span className="text-sm sm:text-base font-semibold text-gray-900">
            출석 그리드
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-gray-200" />
            <span className="text-xs text-gray-500">미출석</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-400" />
            <span className="text-xs text-gray-500">저</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-xs text-gray-500">중</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-600" />
            <span className="text-xs text-gray-500">고</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-700" />
            <span className="text-xs text-gray-500">매우 고</span>
          </div>
        </div>
      </div>

      {/* 예전 레이아웃: 작은 칸 + 촘촘한 간격, 가로 스크롤로 끝까지 채워 보이게 */}
      <div className="flex gap-1">
        <div className="hidden sm:flex flex-col gap-[3px] mr-2 mt-5">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <span key={d} className="text-[10px] text-gray-500">
              {d}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, ci) => (
                <div
                  key={`${wi}-${ci}`}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${getColor(
                    cell.item
                  )} transition-colors`}
                  title={`${cell.date.toLocaleDateString()}${
                    cell.item?.attended ? " • 출석" : " • 미출석"
                  }${cell.item?.count ? ` • 횟수: ${cell.item.count}` : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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

  const handleOpenProfile = () => navigate("/my/profile");
  const handleOpenHistory = () => navigate("/my/history");

  // 더미 출석 데이터 (6개월 ≈ 26주로 확장)
  const attendanceData = useMemo(() => {
    const today = new Date();
    const days = 26 * 7;
    const arr: { date: string; attended: boolean; count?: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${dd}`;

      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const attended = isWeekend ? Math.random() < 0.4 : Math.random() < 0.8;
      const count = attended ? Math.ceil(Math.random() * 4) : undefined;

      arr.push({ date: dateStr, attended, count });
    }
    return arr;
  }, []);

  // API 연동 예시 (주석 처리)
  // useEffect(() => {
  //   const fetchAttendance = async () => {
  //     try {
  //       const res = await fetch("/api/attendance");
  //       const json = await res.json();
  //       // setAttendanceData(json);
  //     } catch (e) {
  //       console.error("attendance fetch error", e);
  //     }
  //   };
  //   fetchAttendance();
  // }, []);

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
            출석 현황
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            하루하루의 참여를 작은 네모로 기록했어요
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <AttendanceGrid data={attendanceData} />
        </div>

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
