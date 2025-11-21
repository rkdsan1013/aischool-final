// src/pages/VoiceRoomCreate.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

type FormState = {
  name: string;
  description: string;
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
 * - openUpwards prop으로 위/아래 열기 제어 (기본: false -> 아래로 열림)
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
  openUpwards?: boolean;
}> = ({
  value,
  onChange,
  options,
  id,
  label,
  openUpwards: propOpenUpwards,
}) => {
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

  // 기본값: 아래로 열림(false). prop으로 제어 가능.
  const openUpwards = propOpenUpwards ?? false;

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
    description: "",
    maxParticipants: "8",
    level: "A1",
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

  const levelOptions = [
    { value: "A1", label: "A1" },
    { value: "A2", label: "A2" },
    { value: "B1", label: "B1" },
    { value: "B2", label: "B2" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
  ];

  return (
    <div className="h-[100dvh] bg-white flex flex-col">
      <header className="w-full bg-rose-500 text-white flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          {/* 좌측: 헤더 멘트 */}
          <h1 className="text-lg font-semibold">새로운 방 만들기</h1>

          {/* 우측: X 버튼 */}
          <button
            type="button"
            onClick={() => navigate("/voiceroom")}
            className="inline-flex items-center text-white hover:bg-white/10 rounded px-2 py-1"
            aria-label="닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
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
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900"
                >
                  방 설명
                </label>
                <input
                  id="description"
                  name="description"
                  placeholder="예: 일상 대화 연습"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              {/* 최대 참여 인원 먼저 배치 (숫자 입력) */}
              <div className="space-y-2">
                <label
                  htmlFor="maxParticipants"
                  className="block text-sm font-medium text-gray-900"
                >
                  최대 참여 인원
                </label>
                <div className="mt-1">
                  <input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min={1}
                    max={100}
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        maxParticipants: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              {/* 권장 레벨은 최대 참여 인원 아래에 배치하고 드롭다운 유지 (아래로 열림) */}
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
                    /* openUpwards 기본값(false) -> 아래로 열림 */
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
