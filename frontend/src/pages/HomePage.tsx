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
  ChevronRight,
  Repeat,
} from "lucide-react";
import type { TrainingType } from "../services/trainingService";

interface TrainingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  colorHex: string;
  repeatsToday: number;
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
      icon: <BookOpen className="w-4 h-4 sm:w-4 sm:h-4" />,
      color: "bg-rose-500",
      colorHex: "#ef4444",
      repeatsToday: 2,
      startType: "vocabulary",
    },
    {
      id: "sentence",
      title: "문장 배열",
      description: "단어를 올바른 순서로 배열하세요",
      icon: <ListOrdered className="w-4 h-4 sm:w-4 sm:h-4" />,
      color: "bg-rose-400",
      colorHex: "#fb7185",
      repeatsToday: 1,
      startType: "sentence",
    },
    {
      id: "matching",
      title: "빈칸 채우기",
      description: "단어와 뜻을 연결하세요",
      icon: <Link2 className="w-4 h-4 sm:w-4 sm:h-4" />,
      color: "bg-pink-500",
      colorHex: "#ec4899",
      repeatsToday: 0,
      startType: "blank",
    },
    {
      id: "writing",
      title: "작문",
      description: "문장을 직접 작성해보세요",
      icon: <PenTool className="w-4 h-4 sm:w-4 sm:h-4" />,
      color: "bg-rose-300",
      colorHex: "#fda4af",
      repeatsToday: 0,
      startType: "writing",
    },
    {
      id: "speaking",
      title: "말하기 연습",
      description: "AI가 발음을 교정해드립니다",
      icon: <Mic className="w-4 h-4 sm:w-4 sm:h-4" />,
      color: "bg-indigo-500",
      colorHex: "#6366f1",
      repeatsToday: 3,
      startType: "speaking",
    },
  ];

  const handleNavigateToTraining = (startType: TrainingType) => {
    navigate("/training", { state: { startType } });
  };

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

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-rose-500 text-white p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="min-w-0 mr-3 sm:mr-4">
              <h1 className="text-base sm:text-2xl font-bold mb-0.5 truncate">
                안녕하세요, {user.name}님!
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">
                오늘도 영어 학습을 시작해볼까요?
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-xs sm:text-base">
                  {streak}일
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-xs sm:text-base">
                  {user.level}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs sm:text-sm font-medium">
                오늘의 학습 진행도
              </span>
              <span className="text-xs sm:text-sm font-bold">
                {todayProgress}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-gray-00 to-white rounded"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-white/70 mt-2">
              목표까지 {100 - todayProgress}% 남았어요!
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">
          오늘의 유닛
        </h2>

        <ul className="space-y-3 sm:space-y-4">
          {steps.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => handleNavigateToTraining(s.startType)}
                onMouseEnter={() => prefetchQuestions(s.startType)}
                className="border-2 border-gray-200 group relative bg-card rounded-2xl p-3 sm:p-4 text-left cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 w-full"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${s.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                    style={{ border: `1px solid ${s.colorHex}` }}
                  >
                    {s.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                        {s.title}
                      </h3>

                      <div className="flex-shrink-0 ml-auto flex items-center gap-2">
                        {prefetchingType === s.startType ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            <Repeat className="w-3.5 h-3.5 text-rose-600" />
                            로딩...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            <Repeat className="w-3.5 h-3.5 text-rose-600" />
                            <span className="font-semibold">
                              {s.repeatsToday}
                            </span>
                            <span className="text-foreground/60">회</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground truncate whitespace-nowrap overflow-hidden">
                      {s.description}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 self-start mt-1 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default HomePage;
