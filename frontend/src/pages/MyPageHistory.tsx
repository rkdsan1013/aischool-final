// src/pages/MyPageHistory.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Calendar, MessageCircle } from "lucide-react";

type ConversationRecord = {
  id: string;
  scenarioTitle: string;
  category: string;
  type: "학습" | "회화" | "기타";
  date: Date;
  messageCount: number;
  preview: string;
};

/* CustomDropdown (downward-opening, keyboard accessible, outside-click/ESC close) */
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
      )
        return;
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
      setActiveIndex((i) => Math.min(options.length - 1, i === -1 ? 0 : i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(0, i === -1 ? 0 : i - 1));
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

  const openUpwards = false; // 아래로 열림

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
        className={`absolute z-50 w-full rounded-md bg-white shadow-sm ring-1 ring-gray-100 transform transition-all duration-200 ease-out ${
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

/* 더미 대화 데이터 (학습 + 회화 포함) */
const conversationsSeed: ConversationRecord[] = [
  {
    id: "cafe-20250114-1",
    scenarioTitle: "카페에서 주문하기",
    category: "카페",
    type: "회화",
    date: new Date(2025, 0, 14, 14, 30),
    messageCount: 12,
    preview: "Hello! Welcome to our coffee shop...",
  },
  {
    id: "shopping-20250113-1",
    scenarioTitle: "쇼핑하기",
    category: "쇼핑",
    type: "회화",
    date: new Date(2025, 0, 13, 16, 20),
    messageCount: 18,
    preview: "Hi there! Are you looking for something...",
  },
  {
    id: "vocab-20250112-1",
    scenarioTitle: "단어 학습",
    category: "단어",
    type: "학습",
    date: new Date(2025, 0, 12, 10, 15),
    messageCount: 30,
    preview: "오늘의 단어: apple, run, beautiful...",
  },
  {
    id: "sentence-20250111-1",
    scenarioTitle: "문장 연습",
    category: "문장",
    type: "학습",
    date: new Date(2025, 0, 11, 19, 0),
    messageCount: 20,
    preview: "I went to the store yesterday...",
  },
  {
    id: "fill-20250110-1",
    scenarioTitle: "빈칸 채우기",
    category: "빈칸",
    type: "학습",
    date: new Date(2025, 0, 10, 13, 45),
    messageCount: 15,
    preview: "She ___ to the market every Sunday...",
  },
  {
    id: "writing-20250109-1",
    scenarioTitle: "작문 연습",
    category: "작문",
    type: "학습",
    date: new Date(2025, 0, 9, 11, 0),
    messageCount: 8,
    preview: "Write a short paragraph about your hometown...",
  },
  {
    id: "speaking-20250108-1",
    scenarioTitle: "스피킹 연습",
    category: "스피킹",
    type: "학습",
    date: new Date(2025, 0, 8, 18, 30),
    messageCount: 25,
    preview: "Let's practice pronunciation and fluency...",
  },
  {
    id: "interview-20250107-1",
    scenarioTitle: "면접 연습",
    category: "면접",
    type: "회화",
    date: new Date(2025, 0, 7, 9, 30),
    messageCount: 22,
    preview: "Good morning! Thank you for coming...",
  },
  {
    id: "travel-20250106-1",
    scenarioTitle: "여행 대화",
    category: "여행",
    type: "회화",
    date: new Date(2025, 0, 6, 20, 0),
    messageCount: 15,
    preview: "Welcome! How can I help you with...",
  },
  {
    id: "free-20250105-1",
    scenarioTitle: "자유 대화",
    category: "자유",
    type: "회화",
    date: new Date(2025, 0, 5, 14, 0),
    messageCount: 12,
    preview: "Hello! I'm your AI conversation partner...",
  },
  {
    id: "custom-20250104-1",
    scenarioTitle: "사용자 시나리오 - 면접 질문 확장",
    category: "나만의 시나리오",
    type: "회화",
    date: new Date(2025, 0, 4, 15, 0),
    messageCount: 10,
    preview: "Custom scenario: practice specific interview questions...",
  },
];

const formatDate = (date: Date) =>
  date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const formatTime = (date: Date) =>
  date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

const MyPageHistory: React.FC = () => {
  const navigate = useNavigate();

  // 필터 상태
  const [startDate, setStartDate] = useState<string>(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState<string>(""); // yyyy-mm-dd
  const [typeFilter, setTypeFilter] = useState<string>("all"); // all | 학습 | 회화
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("all");

  // 서브 카테고리 목록
  const studySubCategories = ["단어", "문장", "빈칸", "작문", "스피킹"];
  const convoSubCategories = [
    "카페",
    "쇼핑",
    "면접",
    "여행",
    "자유",
    "나만의 시나리오",
  ];

  // 날짜 범위 계산 (문자열을 Date로 변환해 비교)
  const toDayStart = (d?: string) => (d ? new Date(d + "T00:00:00") : null);
  const toDayEnd = (d?: string) => (d ? new Date(d + "T23:59:59.999") : null);

  const filterByDateRange = (list: ConversationRecord[]) => {
    const s = toDayStart(startDate);
    const e = toDayEnd(endDate);
    if (!s && !e) return list;
    return list.filter((c) => {
      if (s && c.date < s) return false;
      if (e && c.date > e) return false;
      return true;
    });
  };

  const filterByTypeAndSub = (list: ConversationRecord[]) => {
    let res = list;
    if (typeFilter !== "all")
      res = res.filter((c) => c.type === (typeFilter as "학습" | "회화"));
    if (subCategoryFilter !== "all")
      res = res.filter((c) => c.category === subCategoryFilter);
    return res;
  };

  // 적용된 필터 결과
  const filteredConversations = filterByTypeAndSub(
    filterByDateRange(conversationsSeed)
  );
  const categories = Array.from(
    new Set(conversationsSeed.map((c) => c.category))
  );

  // 드롭다운 옵션
  const typeOptions = [
    { value: "all", label: "전체" },
    { value: "학습", label: "학습" },
    { value: "회화", label: "회화" },
  ];

  // 변경: typeFilter가 'all'일 때에도 '나만의 시나리오'를 포함하도록 함
  const subCategoryOptions =
    typeFilter === "학습"
      ? [
          { value: "all", label: "전체" },
          ...studySubCategories.map((s) => ({ value: s, label: s })),
        ]
      : typeFilter === "회화"
      ? [
          { value: "all", label: "전체" },
          ...convoSubCategories.map((s) => ({ value: s, label: s })),
        ]
      : (() => {
          const base = [
            { value: "all", label: "전체" },
            ...categories.map((c) => ({ value: c, label: c })),
          ];
          if (!base.some((b) => b.value === "나만의 시나리오")) {
            base.push({
              value: "나만의 시나리오",
              label: "나만의 시나리오",
            });
          }
          return base;
        })();

  // type 변경 시 subCategory 초기화
  useEffect(() => {
    setSubCategoryFilter("all");
  }, [typeFilter]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="bg-rose-500 text-white p-4 sm:p-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center text-white/90 hover:text-white transition p-2 rounded"
              aria-label="뒤로"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-0 leading-tight truncate">
                학습 히스토리
              </h1>
              <p className="text-white/80 text-sm sm:text-base truncate">
                지금까지의 학습 기록을 확인하세요
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* 필터 행: type+subcategory는 한 줄(인라인), 날짜 범위 입력 */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
          <div className="flex gap-2 w-full sm:w-auto flex-1">
            <div className="w-40">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                구분
              </label>
              <CustomDropdown
                id="history-type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
                label={null}
              />
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                카테고리
              </label>
              <CustomDropdown
                id="history-subcategory"
                value={subCategoryFilter}
                onChange={setSubCategoryFilter}
                options={subCategoryOptions}
                label={null}
              />
            </div>
          </div>

          <div className="flex gap-2 items-end w-full sm:w-auto">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setTypeFilter("all");
                  setSubCategoryFilter("all");
                }}
                className="ml-2 text-sm text-gray-600 underline"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 대화 목록 */}
        {filteredConversations.length > 0 && (
          <p className="text-sm text-gray-600 mb-4">
            총 {filteredConversations.length}개의 대화
          </p>
        )}

        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => navigate(`/my/conversation-history/${conv.id}`)}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5 cursor-pointer hover:border-rose-300 hover:shadow-md transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      {conv.scenarioTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-medium whitespace-nowrap">
                      {conv.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(conv.date)}</span>
                    <span className="text-gray-300">|</span>
                    <span>{formatTime(conv.date)}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 mb-2">
                    {conv.preview}
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{conv.messageCount}개의 메시지</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredConversations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              {startDate ||
              endDate ||
              typeFilter !== "all" ||
              subCategoryFilter !== "all"
                ? "선택한 조건에 맞는 대화가 없습니다"
                : "아직 저장된 대화가 없습니다"}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {startDate ||
              endDate ||
              typeFilter !== "all" ||
              subCategoryFilter !== "all"
                ? "다른 필터를 선택해보세요"
                : "AI Talk에서 대화를 시작해보세요!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPageHistory;
