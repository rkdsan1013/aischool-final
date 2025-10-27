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
  Pencil,
  Trash2,
  ChevronRight,
  Zap,
} from "lucide-react";

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

/* ScenarioForm props: 초기값이 null인지 아닌지에 따라 onSave 타입이 달라지는 분기형 유니언 */
type ScenarioFormProps =
  | {
      initial: null;
      onCancel: () => void;
      onSave: (payload: Omit<CustomScenario, "id">) => void;
    }
  | {
      initial: CustomScenario;
      onCancel: () => void;
      onSave: (payload: CustomScenario) => void;
    };

const ScenarioForm: React.FC<ScenarioFormProps> = (props) => {
  const initial = props.initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "중급");
  const [context, setContext] = useState(initial?.context ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (initial) {
      const payload: CustomScenario = {
        id: initial.id,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        context: context.trim(),
      };
      props.onSave(payload);
    } else {
      const payload: Omit<CustomScenario, "id"> = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        context: context.trim(),
      };
      props.onSave(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={props.onCancel} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-card w-full max-w-lg rounded-2xl p-6 z-50 shadow-xl"
      >
        <h3 className="text-lg font-semibold mb-4">
          {initial ? "시나리오 편집" : "새 시나리오 만들기"}
        </h3>

        <div className="grid gap-3">
          <label className="text-sm">
            제목
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
              required
            />
          </label>

          <label className="text-sm">
            설명
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            난이도
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
              <option value="전체">전체</option>
            </select>
          </label>

          <label className="text-sm">
            상황 맥락
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            />
          </label>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={props.onCancel}
              className="px-3 py-2 rounded-md hover:bg-muted"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-rose-500 text-white px-4 py-2 rounded-md hover:bg-rose-600"
            >
              저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const AITalkApp: React.FC = () => {
  const [user] = useState<{ name: string; email: string } | null>({
    name: "홍길동",
    email: "test@test.com",
  });
  const [isLoading] = useState(false);

  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<CustomScenario | null>(
    null
  );

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
      colorHex: "#fb7185", // 대표 색을 rose-500로 지정
      difficulty: "전체",
    },
  ];

  const handleScenarioClick = (id: string) => {
    setActiveScenarioId(id);
  };

  const handleCreateCustom = (payload: Omit<CustomScenario, "id">) => {
    const newItem: CustomScenario = {
      id: Date.now().toString(),
      ...payload,
    };
    setCustomScenarios((prev) => [newItem, ...prev]);
    setIsCreateOpen(false);
  };

  const handleStartEdit = (s: CustomScenario, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingScenario(s);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (payload: CustomScenario) => {
    setCustomScenarios((prev) =>
      prev.map((p) => (p.id === payload.id ? payload : p))
    );
    setIsEditOpen(false);
    setEditingScenario(null);
  };

  const handleDeleteCustomScenario = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = customScenarios.filter((s) => s.id !== id);
    setCustomScenarios(updated);
  };

  const closeScenario = () => setActiveScenarioId(null);
  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => setIsCreateOpen(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              AI 기반 영어 학습
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 text-balance">
            AI Talk
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl text-pretty">
            실전 상황을 시뮬레이션하며 AI와 함께 영어 회화를 연습하세요
          </p>
          <div className="mt-6 flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>실시간 피드백</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>맞춤형 시나리오</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>난이도별 학습</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Scenarios Section */}
        <section className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              대화 시나리오
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">
              상황에 맞는 시나리오를 선택하여 실전 대화를 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioClick(s.id)}
                className="group relative bg-card rounded-2xl p-4 sm:p-5 text-left cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                type="button"
                style={{ border: `1px solid ${s.colorHex}` }}
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
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                        {s.difficulty}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 text-pretty">
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
              onClick={openCreate}
              className="flex items-center bg-rose-500 text-white px-3 py-2 rounded-xl shadow-md hover:bg-rose-600 transition-all"
              type="button"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">시나리오 만들기</span>
              <span className="sm:hidden">만들기</span>
            </button>
          </div>

          {customScenarios.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-2xl p-8 sm:p-12 text-center bg-card">
              <div className="bg-gradient-to-br from-rose-100 to-pink-100 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">
                아직 만든 시나리오가 없어요
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-pretty">
                나만의 대화 상황을 만들어 더욱 효과적으로 학습해보세요
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center bg-rose-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-rose-600 transition-all"
                type="button"
              >
                <Plus className="w-4 h-4 mr-2" />첫 시나리오 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {customScenarios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleScenarioClick(s.id)}
                  className="group relative bg-card rounded-2xl p-4 sm:p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ border: `1px solid #e11d48` }} // custom 시나리오는 대표 로즈 색 사용
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

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleStartEdit(s, e)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                        aria-label="edit"
                        type="button"
                      >
                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomScenario(s.id, e)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                        aria-label="delete"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                      </button>
                    </div>

                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Scenario Modal */}
      {activeScenarioId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeScenario}
          />
          <div className="relative bg-card max-w-2xl w-full rounded-2xl p-6 z-50 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {scenarios.find((s) => s.id === activeScenarioId)?.title ||
                    customScenarios.find((c) => c.id === activeScenarioId)
                      ?.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {scenarios.find((s) => s.id === activeScenarioId)
                    ?.description ||
                    customScenarios.find((c) => c.id === activeScenarioId)
                      ?.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={closeScenario}
                  className="text-sm text-muted-foreground px-3 py-1 rounded-md hover:bg-muted"
                >
                  닫기
                </button>
                <button className="bg-rose-500 text-white px-3 py-1 rounded-md hover:bg-rose-600">
                  대화 시작
                </button>
              </div>
            </div>

            <div className="mt-4 border-t pt-4 text-sm text-muted-foreground">
              이 화면은 데모용으로 한 페이지 내에서 시나리오를 시작하는
              인터페이스입니다.
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <ScenarioForm
          initial={null}
          onCancel={closeCreate}
          onSave={(payload) => handleCreateCustom(payload)}
        />
      )}

      {/* Edit Modal */}
      {isEditOpen && editingScenario && (
        <ScenarioForm
          initial={editingScenario}
          onCancel={() => {
            setIsEditOpen(false);
            setEditingScenario(null);
          }}
          onSave={(payload) => handleSaveEdit(payload)}
        />
      )}
    </div>
  );
};

export default AITalkApp;
