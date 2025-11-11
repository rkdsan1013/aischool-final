// src/pages/AITalkCustomScenario.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

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

// [ADDED] VoiceRoomCreate.tsx의 CustomDropdown 컴포넌트 복사
const CustomDropdown: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  label?: React.ReactNode;
}> = ({ value, onChange, options, id, label }) => {
  const uid = id ?? `cd-${Math.random().toString(36).slice(2, 9)}`;
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    options.findIndex((o) => o.value === value)
  );

  useEffect(() => {
    setActiveIndex(options.findIndex((o) => o.value === value));
  }, [value, options]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        !btnRef.current ||
        !panelRef.current ||
        (e.target instanceof Node &&
          (btnRef.current.contains(e.target) ||
            panelRef.current.contains(e.target)))
      ) {
        return;
      }
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    if (open && panelRef.current) {
      const el = panelRef.current.querySelector<HTMLElement>(
        '[data-selected="true"]'
      );
      el?.focus();
    }
  }, [open]);

  const toggleOpen = () => setOpen((s) => !s);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(options.length - 1, i === -1 ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(0, i === -1 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else if (activeIndex >= 0) {
        onChange(options[activeIndex].value);
        setOpen(false);
        btnRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  const onOptionClick = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div className="relative inline-block w-full">
      {label}
      <button
        ref={btnRef}
        id={uid}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
        // [STYLE] 폼 스타일 일관성 (py-3 -> py-2.5)
        className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 bg-white border border-gray-200 text-sm transition focus:outline-none focus:ring-2 focus:ring-rose-300"
      >
        <span className="truncate">
          {options.find((o) => o.value === value)?.label}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-250 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden
        />
      </button>

      <div
        ref={panelRef}
        role="listbox"
        aria-labelledby={uid}
        tabIndex={-1}
        className={`origin-top-right absolute z-50 mt-2 w-full rounded-md bg-white shadow-sm ring-1 ring-gray-100 focus:outline-none transform transition-all duration-250 ease-out ${
          open
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-75 pointer-events-none"
        }`}
        style={{ transformOrigin: "top center" }}
        onKeyDown={onKeyDown}
      >
        <ul className="max-h-56 overflow-auto py-1">
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const isActive = i === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                data-selected={selected ? "true" : "false"}
                onClick={() => onOptionClick(i)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "bg-rose-50 text-rose-700"
                    : isActive
                    ? "bg-gray-100"
                    : "bg-white"
                }`}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
// [ADDED] End of CustomDropdown

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

  // [ADDED] 난이도 옵션
  const difficultyOptions = [
    { value: "초급", label: "초급" },
    { value: "중급", label: "중급" },
    { value: "고급", label: "고급" },
  ];

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
      // [FIX] window.alert -> console.warn으로 변경 (alert 사용 금지)
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
    // [FIX] min-h-screen -> h-[100dvh], pb-20 제거 (앱 레이아웃)
    <div className="h-[100dvh] bg-gray-50 flex flex-col">
      {/* Header [FIX] flex-shrink-0 추가 */}
      <header className="bg-rose-500 text-white flex-shrink-0">
        {/* [STYLE] max-w-5xl, px-4 sm:px-6, py-6 -> py-4, items-center 추가 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/ai-talk")}
            className="inline-flex items-center text-white hover:bg-white/10 px-2 py-1 rounded -ml-2"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            {/* [FIX] 모바일 폰트 크기 조정 */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {editId ? "시나리오 수정" : "나만의 시나리오 만들기"}
            </h1>
            <p className="text-white/90">원하는 대화 상황을 직접 설정하세요</p>
          </div>
        </div>
      </header>

      {/* [FIX] flex-1 overflow-y-auto (내부 스크롤) */}
      <main className="w-full flex-1 overflow-y-auto">
        {/* [FIX] 하단 패딩 수정 (pb-24 -> pb-20) */}
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">
          {/* [STYLE] 섹션 제목 스타일 통일 */}
          <header className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              시나리오 정보
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-pretty">
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
              // [STYLE] 폼 스타일 일관성 (py-2 -> py-2.5)
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
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
              // [STYLE] 폼 스타일 일관성 (py-2 -> py-2.5)
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* [CHANGED] Difficulty (CustomDropdown으로 변경) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              난이도
            </label>
            <CustomDropdown
              value={difficulty}
              onChange={(v) => setDifficulty(v)}
              options={difficultyOptions}
            />
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
              // [STYLE] 폼 스타일 일관성 (py-2 -> py-2.5)
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 overflow-auto"
              onInput={adjustTextareaHeight}
            />
            <p className="text-sm text-gray-500 mt-2">
              AI의 역할, 상황, 대화 스타일 등을 구체적으로 작성하면 더 좋은
              대화를 할 수 있어요
            </p>
          </div>

          {/* [FIX] 버튼 폼에서 제거 (푸터로 이동) */}
        </section>
      </main>

      {/* [FIX] 고정 푸터 추가 */}
      <footer className="w-full bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          {/* [FIX] flex-col sm:flex-row -> flex flex-row (항상 가로 배치) */}
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
