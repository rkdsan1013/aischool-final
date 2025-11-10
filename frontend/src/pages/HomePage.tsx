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
  color: string;
  progress: number;
  startType: TrainingType;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [user] = useState<{ name: string; level: string } | null>({
    name: "홍길동",
    level: "B1",
  });
  const [_isLoading] = useState(false);
  const [streak] = useState<number>(7);
  const [todayProgress] = useState<number>(45);
  const [prefetchingType, setPrefetchingType] = useState<TrainingType | null>(
    null
  );

  useEffect(() => {
    if (!_isLoading && !user) navigate("/auth");
  }, [_isLoading, user, navigate]);

  if (_isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }
  if (!user) return null;

  const steps: TrainingStep[] = [
    {
      id: "vocabulary",
      title: "단어 훈련",
      description: "새로운 단어를 배우고 복습하세요",
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "bg-rose-500",
      progress: 100,
      startType: "vocabulary",
    },
    {
      id: "sentence",
      title: "문장 배열",
      description: "단어를 올바른 순서로 배열하세요",
      icon: <ListOrdered className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "bg-rose-400",
      progress: 100,
      startType: "sentence",
    },
    {
      id: "matching",
      title: "빈칸 채우기",
      description: "단어와 뜻을 연결하세요",
      icon: <Link2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "bg-pink-500",
      progress: 100,
      startType: "blank",
    },
    {
      id: "writing",
      title: "작문",
      description: "문장을 직접 작성해보세요",
      icon: <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "bg-rose-300",
      progress: 100,
      startType: "writing",
    },
    {
      id: "speaking-listening",
      title: "말하기 연습",
      description: "AI가 발음을 교정해드립니다",
      icon: <Mic className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: "bg-indigo-500",
      progress: 100,
      startType: "speakingListening",
    },
  ];

  const isUnlocked = (index: number) =>
    index === 0 ? true : steps[index - 1].progress === 100;

  const handleNavigateToTraining = (
    startType: TrainingType,
    unlocked: boolean
  ) => {
    if (!unlocked) return;
    // 주소는 항상 /training, startType 전달은 location.state 로만
    navigate("/training", { state: { startType } });
  };

  // Optional lightweight prefetch (no caching integration here)
  const prefetchQuestions = async (type: TrainingType) => {
    try {
      setPrefetchingType(type);
      await fetch(`/api/training?type=${encodeURIComponent(type)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // ignore
    } finally {
      setPrefetchingType(null);
    }
  };

  const getBubbleClasses = (
    progress: number,
    unlocked: boolean,
    baseColor: string
  ) => {
    const completed = progress === 100;
    const current = unlocked && progress > 0 && progress < 100;
    if (!unlocked || progress === 0)
      return {
        bubble: "bg-gray-300",
        ring: "",
        iconTint: "text-white opacity-90",
      };
    if (completed)
      return { bubble: baseColor, ring: "", iconTint: "text-white" };
    if (current)
      return {
        bubble: baseColor,
        ring: "ring-4 ring-rose-200",
        iconTint: "text-white",
      };
    return { bubble: baseColor, ring: "", iconTint: "text-white" };
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-rose-500 text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-row items-center justify-between mb-5 sm:mb-6">
            <div className="min-w-0 mr-3 sm:mr-4">
              <h1 className="text-base sm:text-2xl font-bold mb-0.5 tracking-tight leading-snug truncate">
                안녕하세요, {user.name}님!
              </h1>
              <p className="text-white/80 text-xs sm:text-sm tracking-tight">
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

          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-medium tracking-tight">
                오늘의 학습 진행도
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {todayProgress}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-gray-00 to-white rounded"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-white/70 mt-2 tracking-tight">
              목표까지 {100 - todayProgress}% 남았어요!
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4 tracking-tight">
          오늘의 유닛
        </h2>

        <ul className="space-y-4 sm:space-y-6">
          {steps.map((step, idx) => {
            const unlocked = isUnlocked(idx);
            const completed = step.progress === 100;
            const bubble = getBubbleClasses(
              step.progress,
              unlocked,
              step.color
            );
            const prevCompleted =
              idx > 0 ? steps[idx - 1].progress === 100 : false;
            const nextCompleted =
              idx < steps.length - 1 ? steps[idx + 1].progress === 100 : false;
            const connectorColor =
              idx < steps.length - 1 && completed && nextCompleted
                ? "bg-rose-500"
                : "bg-gray-200";
            const topConnectorColor =
              prevCompleted && completed ? "bg-rose-500" : "bg-gray-200";

            return (
              <li key={step.id}>
                <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] gap-3 sm:gap-4 items-center">
                  <div className="relative h-full">
                    {idx > 0 && (
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-[2px] sm:w-[3px] ${topConnectorColor} rounded-full top-[-1rem] sm:top-[-1.5rem] bottom-1/2 mb-5 sm:mb-6`}
                      />
                    )}

                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-sm border border-white/60 flex items-center justify-center z-10 absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
                      <div
                        className={`relative ${bubble.bubble} ${bubble.ring} w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center`}
                      >
                        <div className={bubble.iconTint}>{step.icon}</div>
                      </div>
                    </div>

                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-[2px] sm:w-[3px] ${connectorColor} rounded-full top-1/2 mt-5 sm:mt-6 bottom-[-1rem] sm:bottom-[-1.5rem]`}
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigateToTraining(step.startType, unlocked)
                    }
                    onMouseEnter={() => prefetchQuestions(step.startType)}
                    disabled={!unlocked}
                    className={`w-full text-left bg-white rounded-xl border p-3 sm:p-4 shadow-sm transition transform active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md ${
                      unlocked
                        ? "border-rose-100"
                        : "border-gray-100 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 tracking-tight leading-snug truncate">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5 sm:mt-1 tracking-tight leading-snug">
                          {step.description}
                        </p>
                      </div>

                      {prefetchingType === step.startType ? (
                        <div className="text-sm text-rose-500 font-medium">
                          로딩...
                        </div>
                      ) : completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          완료
                        </span>
                      ) : unlocked ? (
                        <span className="inline-flex items-center text-[11px] sm:text-sm text-rose-600 bg-rose-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                          진행중
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-sm text-gray-600 bg-gray-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                          <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 잠김
                        </span>
                      )}
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
