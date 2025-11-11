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

/**
 * CustomDropdown
 * - 디자인 유지
 * - 항상 위로 열리도록(openUpwards forced true)
 * - fade + scale 애니메이션
 * - 키보드 접근성 지원
 * - 외부 클릭/ESC 닫기
 * - TypeScript 이벤트 핸들러 타입 안정성 처리
 */
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
    function onDocClick(e: Event) {
      if (!btnRef.current || !panelRef.current) return;
      const target = e.target as Node | null;
      if (
        target &&
        (btnRef.current.contains(target) || panelRef.current.contains(target))
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // focus selected/first when opened
  useEffect(() => {
    if (open && panelRef.current) {
      const el = panelRef.current.querySelector<HTMLElement>(
        '[data-selected="true"]'
      ) as HTMLElement | null;
      if (el) {
        el.focus();
        el.scrollIntoView({ block: "nearest" });
      } else {
        const first = panelRef.current.querySelector<HTMLElement>(
          'li[role="option"]'
        ) as HTMLElement | null;
        first?.focus();
      }
    }
  }, [open]);

  const toggleOpen = () => setOpen((s) => !s);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => {
        const next = i + 1;
        return next >= options.length ? options.length - 1 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => {
        const prev = i - 1;
        return prev < 0 ? 0 : prev;
      });
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
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

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const items =
      panelRef.current.querySelectorAll<HTMLElement>('li[role="option"]');
    const el = items[activeIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const onOptionClick = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    btnRef.current?.focus();
  };

  // Force dropdown to open upwards for both instances
  const openUpwards = true;

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
        className={`absolute z-50 w-full rounded-md bg-white shadow-sm ring-1 ring-gray-100 transform transition-all duration-250 ease-out ${
          open
            ? "opacity-100 scale-y-100 pointer-events-auto"
            : "opacity-0 scale-y-75 pointer-events-none"
        } ${
          openUpwards
            ? "bottom-full mb-2 mt-0 origin-bottom"
            : "top-full mt-2 origin-top"
        }`}
        style={{
          transformOrigin: openUpwards ? "bottom center" : "top center",
          maxHeight: "14rem",
        }}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Form Data:", formData);
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
    <div className="h-[100dvh] bg-white flex flex-col">
      <header className="w-full bg-rose-500 text-white flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-4">
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

      <main className="w-full flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
          <section className="w-full p-0">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                방 설정
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                다른 학습자들과 함께할 방을 만들어보세요
              </p>
            </div>

            <form
              id="room-create-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  최대 참여 인원
                </label>
                <div className="mt-1">
                  <CustomDropdown
                    id="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(v) =>
                      setFormData((p) => ({ ...p, maxParticipants: v }))
                    }
                    options={maxOptions}
                    label={null}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  권장 레벨
                </label>
                <div className="mt-1">
                  <CustomDropdown
                    id="level"
                    value={formData.level}
                    onChange={(v) => setFormData((p) => ({ ...p, level: v }))}
                    options={levelOptions}
                    label={null}
                  />
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <button
            type="submit"
            form="room-create-form"
            className="w-full h-12 rounded-lg bg-rose-500 text-white text-lg font-semibold shadow-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            방 만들기
          </button>
        </div>
      </footer>
    </div>
  );
};

export default VoiceRoomCreate;
