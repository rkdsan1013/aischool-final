// frontend/src/pages/AITalkPage.tsx
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

/**
 * 변경 요약
 * - 오버레이 색상: 사용자가 처음 준 코드와 동일한 반투명 검정 (`bg-black/40`)으로 적용하고
 *   overlay를 fixed inset-0로 설정해 푸터까지 완전히 가립니다.
 * - 모달은 화면 중앙에 fixed로 고정되어 스크롤/레이아웃 이동과 무관하게 유지됩니다.
 * - 입력창(textarea)은 사용자가 resize 할 수 없도록 `resize-none`로 고정하고,
 *   내부에서 스크롤되도록 높이/overflow를 설정했습니다.
 * - 입력 상태가 임의로 초기화되는 문제를 방지하기 위해 form 상태는 오직 modalScenario가
 *   변경될 때만 초기화되도록 했고, onChange는 순수하게 로컬 상태만 변경합니다.
 * - 오버레이 클릭 시에만 모달이 닫히며, 모달 내부 클릭은 전파를 막아 다른 페이지로 이동되는
 *   문제를 방지합니다.
 */

/* 화면 표시용 데이터 타입 */
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

  // Controlled form state (모달 편집용)
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    context: "",
  });

  // Refs
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLInputElement | null>(null);
  const ctxRef = useRef<HTMLTextAreaElement | null>(null);

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

  // DB 데이터 Fetching (마운트 시 한 번)
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

  // modalScenario가 변경될 때만 form 초기화 — typing 중 불필요한 초기화를 방지
  useEffect(() => {
    if (!modalScenario) {
      setFormState({ title: "", description: "", context: "" });
      setIsEditing(false);
      return;
    }
    setFormState({
      title: modalScenario.title ?? "",
      description: modalScenario.description ?? "",
      context: modalScenario.context ?? "",
    });
    setIsEditing(false);
  }, [modalScenario]);

  // 모달 열림/닫힘 시 body 스크롤 제어
  useEffect(() => {
    if (modalScenario) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
    return;
  }, [modalScenario]);

  const handleScenarioClick = (id: number) => {
    navigate("/ai-talk/chat", { state: { scenarioId: id } });
  };

  const handleCreateNavigate = () => navigate("/ai-talk/custom-scenario");

  const openModal = (s: DisplayScenario) => {
    setModalScenario(s);
  };

  const closeModal = () => {
    setModalScenario(null);
  };

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
    // 포커스는 modalScenario가 세팅된 이후에만 실행
    setTimeout(() => {
      titleRef.current?.focus();
    }, 0);
  };

  const saveEdit = async () => {
    if (!modalScenario) return;
    const title = (formState.title ?? "").trim();
    if (!title) return;
    const description = (formState.description ?? "").trim();
    const context = (formState.context ?? "").trim();

    try {
      // 서비스 시그니처에 맞춰 호출 (scenarioId, data)
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

      // modalScenario를 업데이트하되, 이로 인해 formState가 초기화되지 않도록
      // modalScenario 변경은 의도적이며 useEffect에서 동일한 값으로만 덮어씌워짐
      setModalScenario(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("수정 실패:", error);
    }
  };

  // Modal component: fixed, overlay bg-black/40 (처음 준 코드 색상과 동일), inputs non-resizable
  const ModalCard: React.FC = () => {
    if (!modalScenario) return null;
    const s = modalScenario;

    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
      >
        {/* overlay: 처음 주신 코드와 동일한 색상 (bg-black/40)로 전체 화면을 덮음 */}
        <div
          className="fixed inset-0 bg-black/40"
          onClick={closeModal}
          aria-hidden="true"
        />

        {/* Modal container: fixed, centered, 스크롤 가능한 내부, max-height로 푸터까지 가려짐 */}
        <div
          className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-4 sm:p-5"
          onClick={(e) => e.stopPropagation()}
          style={{
            border: "1px solid rgba(0,0,0,0.06)",
            maxHeight: "80vh",
            overflow: "auto",
            position: "relative",
          }}
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
                    {isEditing ? formState.title || "제목 없음" : s.title}
                  </h3>
                </div>

                <div className="mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {isEditing
                      ? formState.description || s.description
                      : s.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap line-clamp-3">
                    {isEditing
                      ? formState.context ||
                        s.context ||
                        "상세 컨텍스트가 없습니다."
                      : s.context || "상세 컨텍스트가 없습니다."}
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
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, title: e.target.value }))
                  }
                  name="title"
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-foreground"
                  placeholder="시나리오 제목"
                />

                <input
                  ref={descRef}
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  name="description"
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm"
                  placeholder="간단한 설명"
                />

                {/* textarea: 사용자가 resize 불가, 내부 스크롤 허용, 고정 높이 */}
                <textarea
                  ref={ctxRef}
                  value={formState.context}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      context: e.target.value,
                    }))
                  }
                  name="context"
                  className="w-full bg-white border border-gray-200 rounded-md p-3 text-sm resize-none"
                  rows={8}
                  placeholder="시나리오 상세 컨텍스트"
                  style={{
                    lineHeight: 1.5,
                    height: "160px",
                    maxHeight: "320px",
                    overflowY: "auto",
                  }}
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
                      // 변경 취소: formState를 modalScenario 값으로 되돌림
                      setFormState({
                        title: s.title,
                        description: s.description,
                        context: s.context ?? "",
                      });
                      setIsEditing(false);
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

        {/* Custom scenarios */}
        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                나만의 시나리오
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground text-pretty">
                원하는 상황을 직접 만들어 연습해보세요
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
