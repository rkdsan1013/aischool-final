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
  context: string;
}

const AITalkPage: React.FC = () => {
  const navigate = useNavigate();

  // 샘플 인증 상태 (실제 앱에서는 auth context 사용)
  const [user] = useState<{ name: string; email: string } | null>({
    name: "홍길동",
    email: "test@test.com",
  });
  const [_isLoading] = useState(false);

  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  useEffect(() => {
    if (!_isLoading && !user) {
      navigate("/auth");
    }
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
      icon: <Coffee className="w-6 h-6" />,
      color: "bg-[#8B4513]",
      difficulty: "초급",
    },
    {
      id: "interview",
      title: "면접 연습",
      description: "영어 면접 상황을 시뮬레이션합니다",
      icon: <Briefcase className="w-6 h-6" />,
      color: "bg-rose-500",
      difficulty: "고급",
    },
    {
      id: "travel",
      title: "여행 대화",
      description: "공항, 호텔, 관광지에서의 대화를 연습하세요",
      icon: <Plane className="w-6 h-6" />,
      color: "bg-rose-400",
      difficulty: "중급",
    },
    {
      id: "shopping",
      title: "쇼핑하기",
      description: "매장에서 물건을 구매하는 상황을 연습하세요",
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "bg-rose-300",
      difficulty: "초급",
    },
    {
      id: "study",
      title: "학교 생활",
      description: "학교에서의 다양한 대화를 연습하세요",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "bg-[#5c6bc0]",
      difficulty: "중급",
    },
    {
      id: "dating",
      title: "데이트 대화",
      description: "친구나 연인과의 일상 대화를 연습하세요",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-[#ff7a8f]",
      difficulty: "중급",
    },
    {
      id: "smalltalk",
      title: "스몰토크",
      description: "날씨, 취미 등 가벼운 대화를 연습하세요",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-[#ffa726]",
      difficulty: "초급",
    },
    {
      id: "free",
      title: "자유 대화",
      description: "AI와 자유롭게 대화하며 실력을 향상시키세요",
      icon: <Sparkles className="w-6 h-6" />,
      color: "bg-gradient-to-br from-rose-500 to-rose-300",
      difficulty: "전체",
    },
  ];

  const handleScenarioClick = (id: string) => {
    navigate(`/ai-talk/conversation/${id}`);
  };

  const handleCreateCustom = () => {
    navigate("/ai-talk/custom-scenario");
  };

  const handleEditCustomScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ai-talk/custom-scenario?edit=${id}`);
  };

  const handleDeleteCustomScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customScenarios.filter((s) => s.id !== id);
    setCustomScenarios(updated);
    localStorage.setItem("customScenarios", JSON.stringify(updated));
  };

  if (_isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI Talk</h1>
          <p className="text-white/90">AI와 실전 대화를 연습하세요</p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Scenarios */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">대화 시나리오</h2>
            <p className="text-sm text-gray-500">
              상황에 맞는 시나리오를 선택하여 대화를 시작하세요
            </p>
          </div>

          <div className="space-y-3">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioClick(s.id)}
                className="w-full text-left bg-white border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                type="button"
              >
                <div
                  className={`${s.color} text-white p-3 rounded-xl flex-shrink-0`}
                >
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">
                      {s.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {s.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Custom Scenarios */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">나만의 시나리오</h2>
              <p className="text-sm text-gray-500">
                원하는 상황을 직접 만들어 연습하세요
              </p>
            </div>
            <button
              onClick={handleCreateCustom}
              className="bg-rose-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition"
              type="button"
            >
              <Plus className="w-4 h-4" />
              시나리오 만들기
            </button>
          </div>

          {customScenarios.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                아직 만든 시나리오가 없어요
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                나만의 대화 상황을 만들어 보세요
              </p>
              <button
                onClick={handleCreateCustom}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-600 transition"
                type="button"
              >
                <Plus className="w-4 h-4" />첫 시나리오 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customScenarios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleScenarioClick(s.id)}
                  className="bg-white border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="bg-gradient-to-br from-rose-500 to-rose-300 text-white p-3 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {s.title}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {s.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {s.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditCustomScenario(s.id, e)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                      aria-label="edit"
                      type="button"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomScenario(s.id, e)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition"
                      aria-label="delete"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
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
