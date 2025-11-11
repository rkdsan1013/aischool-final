// src/pages/AITalkPage.tsx
import React, { useEffect, useState } from "react";
import {
  Coffee,
  Briefcase,
  Plane,
  ShoppingBag,
  GraduationCap,
  Heart,
  MessageCircle,
  Sparkles,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  colorHex: string;
  difficulty: string;
}

interface CustomScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  context: string;
}

const AITalkPage: React.FC = () => {
  const navigate = useNavigate();

  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("customScenarios");
    if (saved) {
      try {
        setCustomScenarios(JSON.parse(saved));
      } catch {
        setCustomScenarios([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("customScenarios", JSON.stringify(customScenarios));
  }, [customScenarios]);

  const scenarios: Scenario[] = [
    {
      id: "cafe",
      title: "카페에서 주문하기",
      description: "커피숍에서 음료를 주문하는 상황을 연습하세요",
      icon: <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-amber-500",
      colorHex: "#f59e0b",
      difficulty: "초급",
    },
    {
      id: "interview",
      title: "면접 연습",
      description: "영어 면접 상황을 시뮬레이션합니다",
      icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-rose-500",
      colorHex: "#fb7185",
      difficulty: "고급",
    },
    {
      id: "travel",
      title: "여행 대화",
      description: "공항, 호텔, 관광지에서의 대화를 연습하세요",
      icon: <Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-blue-500",
      colorHex: "#3b82f6",
      difficulty: "중급",
    },
    {
      id: "shopping",
      title: "쇼핑하기",
      description: "매장에서 물건을 구매하는 상황을 연습하세요",
      icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-pink-500",
      colorHex: "#ec4899",
      difficulty: "초급",
    },
    {
      id: "study",
      title: "학교 생활",
      description: "학교에서의 다양한 대화를 연습하세요",
      icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-indigo-500",
      colorHex: "#6366f1",
      difficulty: "중급",
    },
    {
      id: "dating",
      title: "데이트 대화",
      description: "친구나 연인과의 일상 대화를 연습하세요",
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-red-500",
      colorHex: "#ef4444",
      difficulty: "중급",
    },
    {
      id: "smalltalk",
      title: "스몰토크",
      description: "날씨, 취미 등 가벼운 대화를 연습하세요",
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-orange-500",
      colorHex: "#f97316",
      difficulty: "초급",
    },
    {
      id: "free",
      title: "자유 대화",
      description: "AI와 자유롭게 대화하며 실력을 향상시키세요",
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-gradient-to-br from-rose-500 to-pink-500",
      colorHex: "#fb7185",
      difficulty: "전체",
    },
  ];

  const handleScenarioClick = (id: string) => {
    navigate(`/ai-talk/${id}`);
  };

  // 만들기 버튼 전용 함수 (커스텀 페이지로 이동)
  const handleCreateNavigate = () => {
    navigate("/ai-talk/custom-scenario");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* [CHANGED] max-w-4xl -> max-w-5xl로 변경하여 다른 페이지와 통일 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Scenarios Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              대화 시나리오
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">
              상황에 맞는 시나리오를 선택하여 AI와 대화를 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioClick(s.id)}
                className="border-2 border-gray-200 group relative bg-card rounded-2xl p-4 sm:p-5 text-left cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                type="button"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`${s.colorClass} text-white p-2.5 sm:p-3 rounded-xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}
                    style={{ border: `1px solid ${s.colorHex}` }}
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                        {s.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        {s.difficulty}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate whitespace-nowrap overflow-hidden">
                      {s.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Custom Scenarios Section */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                나만의 시나리오
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                원하는 상황을 직접 만들어 연습하세요
              </p>
            </div>
            <button
              onClick={handleCreateNavigate}
              className="flex items-center bg-rose-500 text-white px-3 py-2 rounded-xl shadow-md hover:bg-rose-600 transition-all"
              type="button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">시나리오 만들기</span>
              <span className="sm:hidden">만들기</span>
            </button>
          </div>

          {/* 커스텀 카드 목록은 로컬스토리지에서 읽지만 생성/편집은 별도 페이지에서 처리 */}
          {customScenarios.length === 0 ? (
            <div className="border-3 border-gray-200 border-dashed rounded-2xl p-8 sm:p-12 text-center bg-card">
              <div className="bg-gradient-to-br from-rose-100 to-pink-100 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">
                아직 만든 시나리오가 없어요
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-pretty">
                나만의 대화 상황을 만들어 더욱 효과적으로 학습해보세요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {customScenarios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/ai-talk/${s.id}`)}
                  className="group relative bg-card rounded-2xl p-4 sm:p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ border: `1px solid #e11d48` }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className="bg-gradient-to-br from-rose-500 to-pink-500 text-white p-2.5 sm:p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ border: `1px solid #e11d48` }}
                    >
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {s.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                          {s.difficulty}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 text-pretty">
                        {s.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AITalkPage;
