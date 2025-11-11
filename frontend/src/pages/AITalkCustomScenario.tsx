// src/pages/AITalkCustomScenario.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
    // adjust height on mount and when context changes programmatically
    adjustTextareaHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const scrollHeight = el.scrollHeight;
    // set a max height to avoid growing beyond viewport; allow internal scrolling if needed
    const max = Math.min(scrollHeight, window.innerHeight * 0.5);
    el.style.height = `${max}px`;
  };

  const handleContextChange = (value: string) => {
    setContext(value);
    requestAnimationFrame(adjustTextareaHeight);
  };

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !context.trim()) {
      window.alert("모든 필드를 입력해주세요");
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
    <div className="min-h-screen bg-white">
      <style>{`
        .duration-250 { transition-duration: 250ms; }
        .duration-350 { transition-duration: 350ms; }
        .py-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 12px); padding-top: 12px; }

        /* Footer safe area padding helper used on the page container */
        .pb-footer-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 76px); }

        /* Fixed footer always on bottom */
        .fixed-footer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          background: white;
        }
      `}</style>

      {/* Header - align content start with main content (max-w-4xl, left-aligned) */}
      <div className="bg-rose-500 text-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/ai-talk")}
            className="inline-flex items-center text-white hover:bg-white/10 px-2 py-1 rounded -ml-2"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-3xl font-bold mb-2">
              {editId ? "시나리오 수정" : "나만의 시나리오 만들기"}
            </h1>
            <p className="text-white/90">원하는 대화 상황을 직접 설정하세요</p>
          </div>
        </div>
      </div>

      {/* Main form - add bottom padding so content isn't hidden behind fixed footer */}
      <main className="w-full pb-footer-safe">
        <section className="w-full p-6 max-w-4xl mx-auto">
          <header className="mb-4">
            <h2 className="text-lg font-semibold">시나리오 정보</h2>
            <p className="text-sm text-gray-500 mt-1">
              AI와 대화할 상황을 자세히 설명해주세요
            </p>
          </header>

          {/* Title */}
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
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          {/* Description */}
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
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          {/* Difficulty */}
          <div className="mb-4">
            <label
              htmlFor="difficulty"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              난이도
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>
          </div>

          {/* Context - auto-resizing textarea only; page layout unchanged */}
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
              className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 overflow-auto"
              onInput={adjustTextareaHeight}
            />
            <p className="text-sm text-gray-500 mt-2">
              AI의 역할, 상황, 대화 스타일 등을 구체적으로 작성하면 더 좋은
              대화를 할 수 있어요
            </p>
          </div>
        </section>
      </main>

      {/* Fixed footer with the same buttons (kept styles unchanged) */}
      <footer className="fixed-footer">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-md border border-gray-200 px-4 py-2 bg-white text-sm text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-md bg-rose-500 text-white px-4 py-2 inline-flex items-center justify-center gap-2 hover:bg-rose-600"
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
