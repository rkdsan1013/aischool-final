// src/pages/AITalkCustomScenario.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";

interface CustomScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
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
  const [difficulty, setDifficulty] = useState("초급");
  const [context, setContext] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setEditId(getEditIdFromSearch(location.search));
  }, [location.search]);

  useEffect(() => {
    if (!editId) {
      setTitle("");
      setDescription("");
      setDifficulty("초급");
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
        setDifficulty(found.difficulty ?? "중급");
        setContext(found.context ?? "");
      }
    } catch {
      // ignore parse errors
    }
  }, [editId]);

  useEffect(() => {
    adjustTextareaHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    // 고정 높이 설정: 필요 시 '12rem' 값을 조정하세요
    el.style.height = "10rem";
  };

  const handleContextChange = (value: string) => {
    setContext(value);
    requestAnimationFrame(adjustTextareaHeight);
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !context.trim()) {
      console.warn("모든 필드를 입력해주세요");
      return;
    }

    let scenarios: CustomScenario[] = [];
    try {
      const saved = localStorage.getItem("customScenarios");
      scenarios = saved ? JSON.parse(saved) : [];
    } catch {
      scenarios = [];
    }

    if (editId) {
      const idx = scenarios.findIndex((s) => s.id === editId);
      const payload: CustomScenario = {
        id: editId,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        context: context.trim(),
      };
      if (idx !== -1) scenarios[idx] = payload;
      else scenarios.push(payload);
    } else {
      const newScenario: CustomScenario = {
        id: `custom-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        difficulty,
        context: context.trim(),
      };
      scenarios.push(newScenario);
    }

    try {
      localStorage.setItem("customScenarios", JSON.stringify(scenarios));
    } catch {
      // ignore
    }

    navigate("/ai-talk");
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
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-rose-500 text-white px-4 py-3 inline-flex items-center justify-center gap-2 hover:bg-rose-600 text-sm font-semibold"
            >
              <span>{editId ? "수정하기" : "저장하기"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AITalkCustomScenario;
