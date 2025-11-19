import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
// 외부 서비스 임포트
import { aiTalkService } from "../services/aiTalkService";
import type { AIScenario } from "../services/aiTalkService";

interface CustomScenario {
  id: string;
  title: string;
  description: string;
  context: string;
}

function getEditIdFromSearch(search: string) {
  try {
    const qp = new URLSearchParams(search);
    return qp.get("edit");
  } catch {
    return null;
  }
}

function parseError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;

  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;

    if (typeof e.message === "string") return e.message;
    if (typeof e.statusText === "string") return e.statusText;

    const response = e.response;
    if (typeof response === "object" && response !== null) {
      const r = response as Record<string, unknown>;
      const data = r.data;
      if (typeof data === "object" && data !== null) {
        const d = data as Record<string, unknown>;
        if (typeof d.message === "string") return d.message;
        if (Array.isArray(d.errors) && d.errors.length > 0) {
          const first = d.errors[0];
          if (typeof first === "object" && first !== null) {
            const f = first as Record<string, unknown>;
            if (typeof f.message === "string") return f.message;
          }
        }
      }
    }
  }

  return "저장 중 오류가 발생했습니다";
}

const AITalkCustomScenario: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [editId, setEditId] = useState<string | null>(() =>
    getEditIdFromSearch(location.search)
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setEditId(getEditIdFromSearch(location.search));
  }, [location.search]);

  useEffect(() => {
    if (!editId) {
      setTitle("");
      setDescription("");
      setContext("");
      return;
    }

    try {
      const saved = localStorage.getItem("customScenarios");
      if (!saved) return;
      const arr: CustomScenario[] = JSON.parse(saved);
      const found = arr.find((s) => s.id === editId);
      if (found) {
        setTitle(found.title ?? "");
        setDescription(found.description ?? "");
        setContext(found.context ?? "");
      }
    } catch {
      // parse error 무시
    }
  }, [editId]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight, context]);

  const handleContextChange = useCallback(
    (value: string) => {
      setContext(value);
      requestAnimationFrame(adjustTextareaHeight);
    },
    [adjustTextareaHeight]
  );

  const persistLocal = (scenarios: CustomScenario[]) => {
    try {
      localStorage.setItem("customScenarios", JSON.stringify(scenarios));
    } catch {
      // ignore
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim() || !description.trim() || !context.trim()) {
      setError("모든 필드를 입력해주세요");
      return;
    }

    setLoading(true);
    const payload: { title: string; description: string; context: string } = {
      title: title.trim(),
      description: description.trim(),
      context: context.trim(),
    };

    try {
      // editId가 존재하지만 숫자가 아닌 경우(로컬 전용 id: 예 UUID) -> 로컬만 업데이트
      if (editId && Number.isNaN(Number(editId))) {
        let scenarios: CustomScenario[] = [];
        try {
          const saved = localStorage.getItem("customScenarios");
          scenarios = saved ? JSON.parse(saved) : [];
        } catch {
          scenarios = [];
        }

        const idx = scenarios.findIndex((s) => s.id === editId);
        const newEntry: CustomScenario = {
          id: editId,
          title: payload.title,
          description: payload.description,
          context: payload.context,
        };
        if (idx !== -1) scenarios[idx] = newEntry;
        else scenarios.push(newEntry);
        persistLocal(scenarios);
        navigate("/ai-talk");
        return;
      }

      let savedScenario: AIScenario;

      if (editId) {
        const scenarioIdNum = Number(editId);
        if (Number.isNaN(scenarioIdNum)) {
          throw new Error("유효하지 않은 시나리오 ID입니다");
        }
        savedScenario = await aiTalkService.updateCustomScenario(
          scenarioIdNum,
          payload
        );
      } else {
        savedScenario = await aiTalkService.createCustomScenario(payload);
      }

      const savedId = String(savedScenario.scenario_id);

      let scenarios: CustomScenario[] = [];
      try {
        const saved = localStorage.getItem("customScenarios");
        scenarios = saved ? JSON.parse(saved) : [];
      } catch {
        scenarios = [];
      }

      const idx = scenarios.findIndex((s) => s.id === savedId);
      const newEntry: CustomScenario = {
        id: savedId,
        title: savedScenario.title,
        description: savedScenario.description,
        context: savedScenario.context,
      };
      if (idx !== -1) scenarios[idx] = newEntry;
      else scenarios.push(newEntry);
      persistLocal(scenarios);

      navigate("/ai-talk");
    } catch (err: unknown) {
      console.error("save error:", err);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/ai-talk");
  };

  return (
    <div className="h-[100dvh] bg-white flex flex-col font-sans">
      <header className="bg-rose-500 text-white flex-shrink-0 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {editId ? "시나리오 수정" : "나만의 시나리오 만들기"}
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              원하는 대화 상황을 직접 설정하세요
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/ai-talk")}
            className="inline-flex items-center text-white hover:bg-white/20 p-2 rounded-full transition duration-150"
            aria-label="닫기"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="w-full flex-1 overflow-y-auto">
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">
          <header className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              시나리오 정보 입력
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-pretty">
              AI와 대화할 상황을 자세히 설명해주세요 (모든 필드 필수)
            </p>
          </header>

          {error && (
            <div
              className="mb-4 p-3 bg-red-100 border border-red-300 text-sm text-red-700 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="title"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              시나리오 제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 병원에서 진료 받기"
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-4 focus:ring-rose-200 transition duration-150"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              간단한 설명 *
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 병원에서 증상을 설명하고 진료를 받는 상황"
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base bg-white focus:outline-none focus:ring-4 focus:ring-rose-200 transition duration-150"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="context"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              상황 설명 *
            </label>
            <textarea
              id="context"
              ref={textareaRef}
              value={context}
              onChange={(e) => handleContextChange(e.target.value)}
              placeholder={
                "AI가 어떤 역할을 하고, 어떤 상황인지 자세히 설명해주세요.\n\n예시:\n당신은 병원 접수처 직원입니다. 환자가 처음 방문했고, 증상을 듣고 적절한 진료과를 안내해주세요. 친절하고 전문적인 태도로 대화하며, 필요한 서류나 절차에 대해서도 안내해주세요."
              }
              rows={4}
              className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-base bg-white resize-none focus:outline-none focus:ring-4 focus:ring-rose-200 overflow-auto transition duration-150"
              onInput={adjustTextareaHeight}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              AI의 역할, 상황, 대화 스타일 등을 구체적으로 작성하면 더 좋은
              대화를 할 수 있어요
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 flex-shrink-0 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-row gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-xl bg-rose-500 text-white px-4 py-3 inline-flex items-center justify-center gap-2 hover:bg-rose-600 active:bg-rose-700 disabled:bg-rose-300 text-base font-semibold transition duration-150"
              disabled={loading}
              aria-busy={loading}
            >
              <span>
                {loading ? "저장 중..." : editId ? "수정하기" : "저장하기"}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AITalkCustomScenario;
