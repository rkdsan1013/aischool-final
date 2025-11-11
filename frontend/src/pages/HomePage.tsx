// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ListOrdered,
  PenTool,
  Mic,
  Link2,
  Trophy,
  Flame,
  Lock,
  CheckCircle2,
} from "lucide-react";
import type { TrainingType } from "../services/trainingService";

interface TrainingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string; // Tailwind bg-색상-500 형태
  progress: number; // 0-100
  startType: TrainingType;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // 유저 정보 (예시)
  const [user] = useState<{ name: string; level: string } | null>({
    name: "홍길동",
    level: "B1",
  });
  const [_isLoading] = useState(false); // 로딩 상태
  const [streak] = useState<number>(7); // 연속 학습일
  const [todayProgress] = useState<number>(45); // 오늘 진행도
  const [prefetchingType, setPrefetchingType] = useState<TrainingType | null>(
    null
  );

  useEffect(() => {
    // 유저 정보 없으면 로그인 페이지로 (예시)
    if (!_isLoading && !user) navigate("/auth");
  }, [_isLoading, user, navigate]);

  if (_isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }
  if (!user) return null;

  // 학습 단계 데이터
  const steps: TrainingStep[] = [
    {
      id: "vocabulary",
      title: "단어 훈련",
      description: "새로운 단어를 배우고 복습하세요",
      icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />, // 아이콘 크기 키움
      color: "bg-rose-500",
      progress: 100, // 예시 진행도
      startType: "vocabulary",
    },
    {
      id: "sentence",
      title: "문장 배열",
      description: "단어를 올바른 순서로 배열하세요",
      icon: <ListOrdered className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-rose-400",
      progress: 100,
      startType: "sentence",
    },
    {
      id: "matching",
      title: "빈칸 채우기",
      description: "단어와 뜻을 연결하세요",
      icon: <Link2 className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-pink-500",
      progress: 100, // 예시 진행도 (진행중)
      startType: "blank",
    },
    {
      id: "writing",
      title: "작문",
      description: "문장을 직접 작성해보세요",
      icon: <PenTool className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-rose-300",
      progress: 100, // 예시 진행도 (잠김)
      startType: "writing",
    },
    {
      id: "speaking-listening",
      title: "말하기 연습",
      description: "AI가 발음을 교정해드립니다",
      icon: <Mic className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: "bg-indigo-500",
      progress: 100,
      startType: "speakingListening",
    },
  ];

  // 이전 단계가 완료되었는지 확인
  const isUnlocked = (index: number) =>
    index === 0 ? true : steps[index - 1].progress === 100;

  // 트레이닝 페이지로 이동
  const handleNavigateToTraining = (
    startType: TrainingType,
    unlocked: boolean
  ) => {
    if (!unlocked) return;
    navigate("/training", { state: { startType } });
  };

  // 데이터 프리페칭 (옵션)
  const prefetchQuestions = async (type: TrainingType) => {
    if (!type || prefetchingType === type) return;
    try {
      setPrefetchingType(type);
      // 실제 API 호출 로직 (예시)
      // await trainingService.prefetchQuestions(type);
      await new Promise((resolve) => setTimeout(resolve, 300)); // 임시 지연
    } catch {
      // 에러 무시
    } finally {
      setPrefetchingType(null);
    }
  };

  // 아이콘 버블 스타일 결정
  const getBubbleClasses = (
    progress: number,
    unlocked: boolean,
    baseColor: string
  ) => {
    const completed = progress === 100;
    const current = unlocked && progress > 0 && progress < 100;

    // 잠김 상태 (progress === 0 조건 추가)
    if (!unlocked || progress === 0)
      return {
        bubble: "bg-gray-300",
        ring: "",
        iconTint: "text-white opacity-90",
      };
    // 완료 상태
    if (completed)
      return { bubble: baseColor, ring: "", iconTint: "text-white" };
    // 현재 진행중 상태
    if (current)
      return {
        bubble: baseColor,
        ring: "ring-4 ring-rose-200", // 진행 중일 때 링
        iconTint: "text-white",
      };
    // 기본 (시작 가능) 상태 - unlocked && progress === 0
    return { bubble: baseColor, ring: "", iconTint: "text-white" };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-rose-500 text-white p-4 sm:p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row items-center justify-between mb-5 sm:mb-6">
            <div className="min-w-0 mr-3 sm:mr-4">
              <h1 className="text-xl sm:text-2xl font-bold mb-0.5 tracking-tight leading-snug truncate">
                안녕하세요, {user.name}님!
              </h1>
              <p className="text-white/80 text-sm sm:text-base tracking-tight">
                오늘도 영어 학습을 시작해볼까요?
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-xs sm:text-base tracking-tight">
                  {streak}일
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-xs sm:text-base tracking-tight">
                  {user.level}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar Card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-sm sm:text-base font-medium tracking-tight">
                오늘의 학습 진행도
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight">
                {todayProgress}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-2.5 bg-gradient-to-r from-gray-100 to-white rounded-full transition-all duration-500"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-white/70 mt-2.5 tracking-tight">
              목표까지 {100 - todayProgress}% 남았어요!
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">
          오늘의 유닛
        </h2>

        {/* Step List: space-y-*를 다시 추가하여 항목 간 간격을 만듭니다. */}
        <ul className="space-y-4 sm:space-y-6">
          {steps.map((step, idx) => {
            const unlocked = isUnlocked(idx);
            const completed = step.progress === 100;
            const current =
              unlocked && step.progress > 0 && step.progress < 100;

            const bubble = getBubbleClasses(
              step.progress,
              unlocked,
              step.color
            );

            // --- 연결선 로직 모두 제거 ---

            return (
              // li 요소: py-* 패딩 제거
              <li key={step.id}>
                <div className="grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] gap-3 sm:gap-4 items-center">
                  {/* Icon Bubble: 연결선 로직 제거 및 단순화 */}
                  {/* grid의 items-center가 이 cell을 카드(버튼)와 수직 중앙 정렬합니다. */}
                  <div className="flex items-center justify-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md border-2 border-white/80 flex items-center justify-center z-10 transition-all">
                      <div
                        className={`relative ${bubble.bubble} ${bubble.ring} w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all`}
                      >
                        <div className={`${bubble.iconTint} transition-all`}>
                          {step.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* --- Icon Bubble Cell 끝 --- */}

                  {/* Card Button */}
                  <button
                    type="button"
                    onClick={() =>
                      handleNavigateToTraining(step.startType, unlocked)
                    }
                    onMouseEnter={() =>
                      unlocked && prefetchQuestions(step.startType)
                    }
                    disabled={!unlocked}
                    className={`w-full text-left bg-card rounded-2xl border-2 p-4 sm:p-5 shadow-sm transition-all duration-300 active:scale-[0.99] group ${
                      unlocked
                        ? "border-gray-200 hover:shadow-lg hover:-translate-y-1 hover:border-rose-200 cursor-pointer"
                        : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className={`text-base sm:text-lg font-bold text-foreground truncate ${
                            !unlocked
                              ? "text-gray-500"
                              : "group-hover:text-rose-500"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5 sm:mt-1 tracking-tight leading-snug line-clamp-1">
                          {step.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {prefetchingType === step.startType ? (
                          <div className="text-xs sm:text-sm text-rose-500 font-medium animate-pulse">
                            로딩...
                          </div>
                        ) : completed ? (
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 bg-emerald-50 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            완료
                          </span>
                        ) : current ? (
                          <span className="inline-flex items-center text-xs sm:text-sm text-rose-600 bg-rose-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full font-medium">
                            진행중
                          </span>
                        ) : unlocked ? (
                          <span className="inline-flex items-center text-xs sm:text-sm text-rose-600 bg-rose-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full font-medium group-hover:bg-rose-500 group-hover:text-white transition-all">
                            시작
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 bg-gray-200 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full font-medium">
                            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            잠김
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default HomePage;
