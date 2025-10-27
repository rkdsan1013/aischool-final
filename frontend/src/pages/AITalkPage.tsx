import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  difficulty: string;
}
interface CustomScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  context?: string;
}

const AITalkPage: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState<{ name: string; email: string } | null>({
    name: "홍길동",
    email: "test@test.com",
  });
  const [_isLoading] = useState(false);
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  useEffect(() => {
    if (!_isLoading && !user) navigate("/auth");
  }, [user, _isLoading, navigate]);
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

  const scenarios: Scenario[] = [
    {
      id: "cafe",
      title: "카페에서 주문하기",
      description: "커피숍에서 음료를 주문하는 상황을 연습하세요",
      icon: <Coffee className="w-5 h-5" />,
      color: "bg-rose-500",
      difficulty: "초급",
    },
    {
      id: "interview",
      title: "면접 연습",
      description: "영어 면접 상황을 시뮬레이션합니다",
      icon: <Briefcase className="w-5 h-5" />,
      color: "bg-rose-500/95",
      difficulty: "고급",
    },
    {
      id: "travel",
      title: "여행 대화",
      description: "공항, 호텔, 관광지에서의 대화를 연습하세요",
      icon: <Plane className="w-5 h-5" />,
      color: "bg-rose-500/90",
      difficulty: "중급",
    },
    {
      id: "shopping",
      title: "쇼핑하기",
      description: "매장에서 물건을 구매하는 상황을 연습하세요",
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "bg-rose-500/85",
      difficulty: "초급",
    },
    {
      id: "study",
      title: "학교 생활",
      description: "학교에서의 다양한 대화를 연습하세요",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "bg-rose-500/80",
      difficulty: "중급",
    },
    {
      id: "dating",
      title: "데이트 대화",
      description: "친구나 연인과의 일상 대화를 연습하세요",
      icon: <Heart className="w-5 h-5" />,
      color: "bg-rose-500/75",
      difficulty: "중급",
    },
    {
      id: "smalltalk",
      title: "스몰토크",
      description: "날씨, 취미 등 가벼운 대화를 연습하세요",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-rose-500/70",
      difficulty: "초급",
    },
    {
      id: "free",
      title: "자유 대화",
      description: "AI와 자유롭게 대화하며 실력을 향상시키세요",
      icon: <Sparkles className="w-5 h-5" />,
      color: "bg-gradient-to-br from-rose-500 to-rose-300",
      difficulty: "전체",
    },
  ];

  const handleScenarioClick = (id: string) =>
    navigate(`/ai-talk/conversation/${id}`);
  const handleCreateCustom = () => navigate("/ai-talk/custom-scenario");
  const handleEditCustomScenario = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/ai-talk/custom-scenario?edit=${id}`);
  };
  const handleDeleteCustomScenario = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = customScenarios.filter((s) => s.id !== id);
    setCustomScenarios(updated);
    localStorage.setItem("customScenarios", JSON.stringify(updated));
  };

  if (_isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-800">
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* 상단 타이틀 영역 (헤더 제거 요청에 따라 간결하게 배치) */}

        {/* 나만의 시나리오 (항상 상단, 모바일 1열) */}
        <section className="mb-6">
          {customScenarios.length === 0 ? (
            <div className="rounded-2xl p-5 bg-white shadow-sm text-center">
              <Sparkles className="w-10 h-10 text-rose-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">
                아직 만든 시나리오가 없어요
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                원하는 상황을 만들어 바로 시작할 수 있어요
              </p>
              <div className="sm:hidden">
                <button
                  onClick={handleCreateCustom}
                  className="w-full bg-rose-500 text-white px-4 py-3 rounded-xl flex items-center gap-2 justify-center shadow-md hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-300"
                  type="button"
                  aria-label="첫 시나리오 만들기 (모바일)"
                >
                  <Plus className="w-5 h-5" />첫 시나리오 만들기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {customScenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleScenarioClick(s.id)}
                  className="w-full text-left bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  type="button"
                  aria-label={`시나리오 ${s.title} 열기`}
                >
                  <div className="bg-rose-500 text-white p-3 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-base truncate">
                        {s.title}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {s.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-1 truncate">
                      {s.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleEditCustomScenario(s.id, e)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition focus:outline-none"
                      aria-label={`시나리오 ${s.title} 편집`}
                      type="button"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomScenario(s.id, e)}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition focus:outline-none"
                      aria-label={`시나리오 ${s.title} 삭제`}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 추천 시나리오 (하단, 모바일 1열 고정) */}
        <section className="mt-6">
          <div className="mb-3">
            <h2 className="text-base font-semibold mb-0.5">추천 시나리오</h2>
            <p className="text-xs text-gray-500">
              상황별로 빠르게 연습해보세요
            </p>
          </div>

          <div className="space-y-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioClick(s.id)}
                className="w-full text-left bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-200"
                type="button"
                aria-label={`${s.title} 시작`}
              >
                <div
                  className={`rounded-xl p-3 ${s.color} text-white flex-shrink-0`}
                >
                  {s.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-base truncate">
                      {s.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1 truncate">
                    {s.description}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* 모바일 하단 CTA */}
      <footer className="fixed inset-x-0 bottom-4 sm:bottom-6 flex justify-center pointer-events-none z-40">
        <div className="max-w-3xl w-full px-4 pointer-events-auto">
          <div className="sm:hidden">
            <button
              onClick={handleCreateCustom}
              className="w-full bg-rose-500 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:bg-rose-600 transition focus:outline-none focus:ring-2 focus:ring-rose-300"
              type="button"
              aria-label="새 시나리오 만들기 (하단)"
            >
              <Plus className="w-5 h-5" />
              나만의 시나리오 만들기
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AITalkPage;
