// src/pages/AITalkCustomScenario.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
// 변경
import { aiTalkService } from "../services/aiTalkService";
import type { AIScenario } from "../services/aiTalkService";

interface CustomScenario {
  id: string; // 로컬/프론트엔드에서 사용하는 id (백엔드의 scenario_id를 문자열로 변환)
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

  // 초기화 및 기존 데이터 로드 (로컬 캐시에서 먼저 불러옴)
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

  useEffect(() => {
    adjustTextareaHeight();
  }, []);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    // 기본 높이 리셋 후 컨텐츠에 맞춰 자동 확장(간단한 방식)
    el.style.height = "6rem";
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.max(6 * 16, scrollHeight)}px`;
  };

  const handleContextChange = (value: string) => {
    setContext(value);
    requestAnimationFrame(adjustTextareaHeight);
  };

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
    const payload = {
      title: title.trim(),
      description: description.trim(),
      context: context.trim(),
    };

    try {
      // 백엔드에 저장 (aiTalkService의 createCustomScenario / updateCustomScenario 사용)
      let savedScenario: AIScenario;

      if (editId) {
        // editId는 string (URL) -> 숫자로 변환해서 백엔드에 전달
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

      // 백엔드 응답(AIScenario)의 scenario_id를 프론트 id로 변환
      const savedId = String(savedScenario.scenario_id);

      // 백엔드 저장 성공 시 로컬 캐시 업데이트
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
    } catch (err: any) {
      console.error("save error:", err);
      const msg =
        err?.message || (err?.statusText ? String(err.statusText) : null);
      setError(msg || "저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/ai-talk");
  };

  return (
    <div className="h-[100dvh] bg-white flex flex-col">
      <header className="bg-rose-500 text-white flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* 헤더 멘트 영역 */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {editId ? "시나리오 수정" : "나만의 시나리오 만들기"}
            </h1>
            <p className="text-white/90">원하는 대화 상황을 직접 설정하세요</p>
          </div>

          {/* 상단 우측 X 버튼 */}
          <button
            type="button"
            onClick={() => navigate("/ai-talk")}
            className="inline-flex items-center text-white hover:bg-white/10 px-2 py-1 rounded"
            aria-label="닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="w-full flex-1 overflow-y-auto">
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">
          <header className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              시나리오 정보
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-pretty">
              AI와 대화할 상황을 자세히 설명해주세요
            </p>
          </header>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              시나리오 제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 병원에서 진료 받기"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              간단한 설명 *
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 병원에서 증상을 설명하고 진료를 받는 상황"
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="context"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 overflow-auto"
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

      <footer className="w-full bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-row gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-rose-500 text-white px-4 py-3 inline-flex items-center justify-center gap-2 hover:bg-rose-600 text-sm font-semibold"
              disabled={loading}
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
