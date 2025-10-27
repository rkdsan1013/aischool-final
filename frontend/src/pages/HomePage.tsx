import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ListOrdered,
  PenTool,
  Mic,
  Link2,
  Zap,
  Trophy,
  Flame,
} from "lucide-react";

interface TrainingCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  locked: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 샘플 인증/유저 데이터 (실제 앱은 auth context로 교체)
  const [user] = useState<{ name: string; level: string } | null>({
    name: "홍길동",
    level: "B1",
  });
  const [_isLoading] = useState(false);

  // 화면에서 사용할 상태 (setter가 사용되지 않으면 제거하여 TS 경고 방지)
  const [streak] = useState<number>(7);
  const [todayProgress] = useState<number>(45);

  useEffect(() => {
    if (!_isLoading && !user) {
      navigate("/auth");
    }
  }, [user, _isLoading, navigate]);

  if (_isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!user) return null;

  const trainingCards: TrainingCard[] = [
    {
      id: "vocabulary",
      title: "단어 훈련",
      description: "새로운 단어를 배우고 복습하세요",
      icon: <BookOpen className="w-6 h-6" />,
      color: "bg-rose-500",
      progress: 60,
      locked: false,
    },
    {
      id: "sentence",
      title: "문장 배열",
      description: "단어를 올바른 순서로 배열하세요",
      icon: <ListOrdered className="w-6 h-6" />,
      color: "bg-rose-400",
      progress: 40,
      locked: false,
    },
    {
      id: "writing",
      title: "작문",
      description: "문장을 직접 작성해보세요",
      icon: <PenTool className="w-6 h-6" />,
      color: "bg-rose-300",
      progress: 20,
      locked: false,
    },
    {
      id: "pronunciation",
      title: "발음",
      description: "AI가 발음을 교정해드립니다",
      icon: <Mic className="w-6 h-6" />,
      color: "bg-[#5c6bc0]",
      progress: 30,
      locked: false,
    },
    {
      id: "matching",
      title: "의미 매칭",
      description: "단어와 뜻을 연결하세요",
      icon: <Link2 className="w-6 h-6" />,
      color: "bg-[#ff7a8f]",
      progress: 50,
      locked: false,
    },
    {
      id: "mission",
      title: "즉시 피드백 미션",
      description: "실시간으로 피드백을 받으세요",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-[#ffa726]",
      progress: 0,
      locked: false,
    },
  ];

  const handleTrainingClick = (trainingId: string) => {
    navigate(`/home/training/${trainingId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-rose-500 text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">
                안녕하세요, {user.name}님!
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">
                오늘도 영어 학습을 시작해볼까요?
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-sm sm:text-base">
                  {streak}일
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-sm sm:text-base">
                  {user.level}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">
                오늘의 학습 진행도
              </span>
              <span className="text-xs sm:text-sm font-bold">
                {todayProgress}%
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded overflow-hidden">
              <div
                className="h-2 bg-white rounded"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-2">
              목표까지 {100 - todayProgress}% 남았어요!
            </p>
          </div>
        </div>
      </header>

      {/* Training Cards */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-4">오늘의 훈련</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingCards.map((card) => (
            <article
              key={card.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition transform hover:scale-[1.02] border-2 border-gray-100 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${card.color} text-white p-3 rounded-xl`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                {card.locked && (
                  <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    잠김
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>진행도</span>
                  <span className="font-semibold">{card.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="h-2 bg-rose-500 rounded"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => !card.locked && handleTrainingClick(card.id)}
                    type="button"
                    className={`w-full h-10 rounded-lg font-medium text-sm ${
                      card.locked
                        ? "bg-white text-gray-500 border border-gray-200 cursor-not-allowed"
                        : "bg-rose-500 text-white hover:bg-rose-600"
                    }`}
                    disabled={card.locked}
                  >
                    {card.locked ? "잠금 해제 필요" : "시작하기"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
