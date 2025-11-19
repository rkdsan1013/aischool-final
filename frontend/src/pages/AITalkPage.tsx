import React, { useEffect, useRef, useState } from "react";
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
  Trash2,
  Edit3,
  Play,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aiTalkService } from "../services/aiTalkService";

// 화면 표시용 데이터 타입
interface DisplayScenario {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  colorHex: string;
  context?: string;
}

const AITalkPage: React.FC = () => {
  const navigate = useNavigate();

  const [officialScenarios, setOfficialScenarios] = useState<DisplayScenario[]>(
    []
  );
  const [customScenarios, setCustomScenarios] = useState<DisplayScenario[]>([]);
  const [modalScenario, setModalScenario] = useState<DisplayScenario | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DisplayScenario>>({});

  const titleRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLInputElement | null>(null);
  const ctxRef = useRef<HTMLTextAreaElement | null>(null);

  // 스타일 매핑 헬퍼
  const getScenarioStyle = (title: string) => {
    if (title.includes("카페")) {
      return {
        icon: <Coffee className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-amber-500",
        colorHex: "#f59e0b",
      };
    }
    if (title.includes("면접")) {
      return {
        icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-rose-500",
        colorHex: "#fb7185",
      };
    }
    if (title.includes("여행")) {
      return {
        icon: <Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-blue-500",
        colorHex: "#3b82f6",
      };
    }
    if (title.includes("쇼핑")) {
      return {
        icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-pink-500",
        colorHex: "#ec4899",
      };
    }
    if (title.includes("학교")) {
      return {
        icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-indigo-500",
        colorHex: "#6366f1",
      };
    }
    if (title.includes("데이트")) {
      return {
        icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-red-500",
        colorHex: "#ef4444",
      };
    }
    if (title.includes("스몰토크")) {
      return {
        icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
        colorClass: "bg-orange-500",
        colorHex: "#f97316",
      };
    }
    return {
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />,
      colorClass: "bg-gradient-to-br from-rose-500 to-pink-500",
      colorHex: "#fb7185",
    };
  };

  // DB 데이터 Fetching
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const data = await aiTalkService.getScenarios();

        const official: DisplayScenario[] = [];
        const custom: DisplayScenario[] = [];

        data.forEach((item) => {
          const style = getScenarioStyle(item.title);
          const formatted: DisplayScenario = {
            id: item.scenario_id,
            title: item.title,
            description: item.description,
            context: item.context,
            icon: style.icon,
            colorClass: style.colorClass,
            colorHex: style.colorHex,
          };

          if (item.user_id === null) {
            official.push(formatted);
          } else {
            custom.push(formatted);
          }
        });

        setOfficialScenarios(official);
        setCustomScenarios(custom);
      } catch (error) {
        console.error("시나리오 로딩 실패:", error);
      }
    };

    fetchScenarios();
  }, []);

  // 모달 초기값 세팅
  useEffect(() => {
    if (!modalScenario) {
      setEditForm({});
      return;
    }

    const s = modalScenario;
    setEditForm({
      title: s.title,
      description: s.description,
      context: s.context,
    });
  }, [modalScenario]);

  // 시나리오 클릭 핸들러: State와 함께 고정 경로로 navigate
  const handleScenarioClick = (id: number) => {
    navigate("/ai-talk/chat", { state: { scenarioId: id } });
  };

  const handleCreateNavigate = () => navigate("/ai-talk/custom-scenario");

  const openModal = (s: DisplayScenario) => {
    setModalScenario(s);
    setIsEditing(false);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalScenario(null);
    setIsEditing(false);
    setEditForm({});
    document.body.style.overflow = "";
  };

  // 모달 내 '대화 시작' 버튼 핸들러
  const startConversation = (s: DisplayScenario) => {
    closeModal();
    navigate("/ai-talk/chat", { state: { scenarioId: s.id } });
  };

  const deleteScenario = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await aiTalkService.deleteCustomScenario(id);
      setCustomScenarios((prev) => prev.filter((c) => c.id !== id));
      closeModal();
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  const startEditing = () => {
    if (!modalScenario) return;
    setIsEditing(true);
    // ref 값 초기화 (defaultValue가 아닌 value에 직접 할당해야 함)
    setTimeout(() => {
      if (titleRef.current) titleRef.current.value = modalScenario.title;
      if (descRef.current) descRef.current.value = modalScenario.description;
      if (ctxRef.current) ctxRef.current.value = modalScenario.context || "";
    }, 0);
  };

  // Null check 경고 해결 (Optional chaining 사용)
  const saveEdit = async () => {
    if (!modalScenario) return;
    // Null 체크를 강화하여 경고 해결
    const title = (titleRef.current?.value ?? "").trim();
    if (!title) return;
    const description = (descRef.current?.value ?? "").trim();
    const context = (ctxRef.current?.value ?? "").trim();

    try {
      await aiTalkService.updateCustomScenario(modalScenario.id, {
        title,
        description,
        context,
      });

      const updated: DisplayScenario = {
        ...modalScenario,
        title,
        description,
        context,
      };

      setCustomScenarios((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setEditForm({ title, description, context });
      setModalScenario(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("수정 실패:", error);
    }
  };

  const ModalCard: React.FC = () => {
    if (!modalScenario) return null;
    const s = modalScenario;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={closeModal}
          aria-hidden="true"
        />

        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 sm:p-5 z-10"
          onClick={(e) => e.stopPropagation()}
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start gap-3">
            <div
              className="bg-gradient-to-br from-rose-500 to-pink-500 text-white p-2.5 rounded-xl shadow-md flex-shrink-0"
              style={{ border: "1px solid #e11d48" }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div>
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                    {editForm.title ?? s.title}
                  </h3>
                </div>

                <div className="mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {editForm.description ?? s.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap line-clamp-3">
                    {editForm.context ??
                      s.context ??
                      "상세 컨텍스트가 없습니다."}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="ml-auto p-2 rounded-md hover:bg-gray-100"
              type="button"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            {isEditing ? (
              <div className="w-full bg-white rounded-xl p-3 space-y-3">
                <input
                  ref={titleRef}
                  defaultValue={editForm.title ?? s.title ?? ""}
                  name="title"
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-foreground"
                  placeholder="시나리오 제목"
                />

                <input
                  ref={descRef}
                  defaultValue={editForm.description ?? s.description ?? ""}
                  name="description"
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
                  placeholder="간단한 설명"
                />

                <textarea
                  ref={ctxRef}
                  defaultValue={editForm.context ?? s.context ?? ""}
                  name="context"
                  className="w-full bg-white border border-gray-200 rounded-md p-3 text-sm"
                  rows={6}
                  placeholder="시나리오 상세 컨텍스트"
                />

                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="flex-1 bg-rose-500 text-white px-3 py-2 rounded-lg"
                    type="button"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      if (titleRef.current)
                        titleRef.current.value = s.title ?? "";
                      if (descRef.current)
                        descRef.current.value = s.description ?? "";
                      if (ctxRef.current)
                        ctxRef.current.value = s.context ?? "";
                      setIsEditing(false);
                      setEditForm({
                        title: s.title,
                        description: s.description,
                        context: s.context,
                      });
                    }}
                    className="flex-1 bg-white border px-3 py-2 rounded-lg"
                    type="button"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <button
                  onClick={() => startConversation(s)}
                  className="w-full flex items-center justify-between bg-rose-500 text-white px-4 py-2 rounded-xl shadow-md hover:bg-rose-600 transition"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5" />
                    <span className="font-medium">대화 시작</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <button
                  onClick={startEditing}
                  className="w-full flex items-center justify-between bg-white border px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-5 h-5" />
                    <span className="font-medium">수정</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <button
                  onClick={() => deleteScenario(s.id)}
                  className="w-full flex items-center justify-between bg-white border px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition text-red-600"
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5" />
                    <span className="font-medium">삭제</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            {officialScenarios.map((s) => (
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

        {/* 커스텀 시나리오 섹션 */}
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
                  className="group relative bg-card rounded-2xl p-4 sm:p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                  onClick={() => openModal(s)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className="bg-gradient-to-br from-rose-500 to-pink-500 text-white p-2.5 sm:p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                      style={{ border: "1px solid #e11d48" }}
                    >
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {s.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 text-pretty">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalScenario && <ModalCard />}
    </div>
  );
};

export default AITalkPage;
