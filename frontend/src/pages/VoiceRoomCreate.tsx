// src/pages/VoiceRoomCreate.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

type FormState = {
  name: string;
  topic: string;
  maxParticipants: string;
  level: string;
};

function useAuth() {
  const [isLoading] = useState<boolean>(false);
  const [user] = useState<{ id: string; name: string } | null>({
    id: "1",
    name: "TestUser",
  });
  return { user, isLoading };
}

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
        className="w-full flex items-center justify-between rounded-md px-3 py-3 bg-slate-50 text-sm transition duration-200 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-rose-200"
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
                    ? "bg-slate-50"
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

const VoiceRoomCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const [formData, setFormData] = useState<FormState>({
    name: "",
    topic: "",
    maxParticipants: "8",
    level: "전체",
  });

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    navigate("/voiceroom");
  };

  const maxOptions = [
    { value: "4", label: "4명" },
    { value: "6", label: "6명" },
    { value: "8", label: "8명" },
    { value: "10", label: "10명" },
    { value: "12", label: "12명" },
  ];

  const levelOptions = [
    { value: "전체", label: "전체" },
    { value: "A1-A2", label: "A1-A2 (초급)" },
    { value: "A2-B1", label: "A2-B1 (초중급)" },
    { value: "B1-B2", label: "B1-B2 (중급)" },
    { value: "B2-C1", label: "B2-C1 (중고급)" },
    { value: "C1-C2", label: "C1-C2 (고급)" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full bg-rose-500 text-white">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/voiceroom")}
            className="inline-flex items-center text-white hover:bg-white/10 rounded px-2 py-1"
            aria-label="돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-semibold">새로운 방 만들기</h1>
        </div>
      </header>

      <main className="w-full flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-12">
          <section className="w-full p-0">
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">방 설정</h2>
              <p className="text-sm text-gray-600 mb-6">
                다른 학습자들과 함께할 방을 만들어보세요
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-900"
                  >
                    방 이름
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="예: 초보자 환영방"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-transparent px-3 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium text-gray-900"
                  >
                    주제
                  </label>
                  <input
                    id="topic"
                    name="topic"
                    placeholder="예: 일상 대화 연습"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-transparent px-3 py-3 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    최대 참여 인원
                  </label>
                  <CustomDropdown
                    value={formData.maxParticipants}
                    onChange={(v) =>
                      setFormData((p) => ({ ...p, maxParticipants: v }))
                    }
                    options={maxOptions}
                    label={null}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    권장 레벨
                  </label>
                  <CustomDropdown
                    value={formData.level}
                    onChange={(v) => setFormData((p) => ({ ...p, level: v }))}
                    options={levelOptions}
                    label={null}
                  />
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-sm md:relative md:bottom-auto">
        <div className="max-w-4xl mx-auto px-4 py-safe">
          <div className="py-3">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full h-12 rounded-lg bg-rose-500 text-white text-lg font-semibold shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              방 만들기
            </button>
          </div>
        </div>
      </footer>

      <style>{`
        .duration-250 { transition-duration: 250ms; }
        .duration-350 { transition-duration: 350ms; }
        .py-safe { padding-bottom: calc(env(safe-area-inset-bottom) + 12px); padding-top: 12px; }
      `}</style>
    </div>
  );
};

export default VoiceRoomCreate;
