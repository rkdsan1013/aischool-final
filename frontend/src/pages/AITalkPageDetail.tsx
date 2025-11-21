import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { Mic, Volume2, Languages, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import FloatingFeedbackCard, {
  type FeedbackPayload,
  type ErrorType,
} from "../components/FloatingFeedbackCard";

type DummyErrorInput = {
  index?: number;
  word?: string;
  type: ErrorType;
  message: string;
};

// 프론트엔드 표시용 메시지 타입
type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  feedback?: FeedbackPayload;
};

// 기존 하드코딩 데이터 구조
const STATIC_SCENARIOS = {
  "1": {
    id: "free",
    title: "자유 대화",
    initialMessage:
      "Hello! I'm your AI conversation partner. What would you like to talk about today?",
    context: "You are a friendly AI assistant ready to discuss any topic.",
  },
  "2": {
    id: "smalltalk",
    title: "스몰토크",
    initialMessage: "Hi! How's the weather today?",
    context:
      "You are a friendly person interested in chatting about hobbies and weather.",
  },
  "3": {
    id: "cafe",
    title: "카페에서 주문하기",
    initialMessage:
      "Hello! Welcome to our coffee shop. What can I get for you today?",
    context: "You are a friendly barista at a coffee shop.",
  },
  "4": {
    id: "shopping",
    title: "쇼핑하기",
    initialMessage: "Hi there! Are you looking for something specific today?",
    context: "You are a helpful sales assistant.",
  },
  "5": {
    id: "study",
    title: "학교 생활",
    initialMessage: "Hi! What class do you have next?",
    context: "You are a friendly classmate.",
  },
  "6": {
    id: "travel",
    title: "여행 대화",
    initialMessage: "Welcome! How can I help you with your travel plans today?",
    context: "You are a travel agent.",
  },
  "7": {
    id: "dating",
    title: "데이트 대화",
    initialMessage:
      "It's nice meeting you here. What do you enjoy doing for fun?",
    context: "You are a friendly date partner.",
  },
  "8": {
    id: "interview",
    title: "면접 연습",
    initialMessage:
      "Good morning! Thank you for coming in today. Please tell me about yourself.",
    context: "You are a hiring manager conducting an interview.",
  },
};

// ✅ 모든 에러 타입(Word, Grammar, Spelling, Style)을 포함한 더미 데이터
function buildDummyMessages(initial: string): Message[] {
  const feedbackErrors = (errors: DummyErrorInput[]) =>
    errors.map((e) => ({
      ...e,
      index: e.index ?? null,
      word: e.word ?? null,
    }));
  const now = () => new Date();

  return [
    // 0. AI 인사말
    { id: "ai-0", role: "ai", content: initial, timestamp: now() },

    // 1. Word Error (비표준/단어 선택)
    {
      id: "user-1",
      role: "user",
      content: "He ain't coming to the meeting.",
      timestamp: now(),
      feedback: {
        errors: feedbackErrors([
          {
            index: 1,
            word: "ain't",
            type: "word" as ErrorType,
            message: "비표준적이고 구어체적인 표현입니다.",
          },
        ]),
        explanation: "공식적 맥락에서는 'isn't' 또는 'is not'을 사용합니다.",
        suggestion: "He isn't coming to the meeting.",
      },
    },

    {
      id: "ai-1",
      role: "ai",
      content:
        "Thanks for letting me know. Is there a reason he can't make it?",
      timestamp: now(),
    },

    // 2. Grammar Error (문법)
    {
      id: "user-2",
      role: "user",
      content: "She go to the office every day.",
      timestamp: now(),
      feedback: {
        errors: feedbackErrors([
          {
            index: 1,
            word: "go",
            type: "grammar" as ErrorType,
            message: "주어 'She'에 맞게 현재형 동사에 -s가 필요합니다.",
          },
        ]),
        explanation: "3인칭 단수 주어에는 현재형 동사에 -s를 붙입니다.",
        suggestion: "She goes to the office every day.",
      },
    },

    {
      id: "ai-2",
      role: "ai",
      content: "Got it. What does she usually do there?",
      timestamp: now(),
    },

    // 3. Spelling Error (철자)
    {
      id: "user-3",
      role: "user",
      content: "I didn't recieve the email yet.",
      timestamp: now(),
      feedback: {
        errors: feedbackErrors([
          {
            index: 3,
            word: "recieve",
            type: "spelling" as ErrorType,
            message: "'receive' 철자가 틀렸습니다.",
          },
        ]),
        explanation: "'receive'는 'ei' 순서로 적어야 합니다.",
        suggestion: "I didn't receive the email yet.",
      },
    },

    {
      id: "ai-3",
      role: "ai",
      content: "I'll check the server logs. Anything else?",
      timestamp: now(),
    },

    // 4. Style Error (스타일/뉘앙스)
    {
      id: "user-4",
      role: "user",
      content: "Give me the report right now.",
      timestamp: now(),
      feedback: {
        errors: feedbackErrors([
          {
            type: "style" as ErrorType,
            message: "너무 직설적이고 무례하게 들릴 수 있습니다.",
          },
        ]),
        explanation:
          "비즈니스 상황에서는 좀 더 정중한 표현을 사용하는 것이 좋습니다.",
        suggestion: "Could you please send me the report?",
      },
    },
  ];
}

// --- 유틸리티 함수들 ---
function tokenizeWithIndices(text: string): { token: string; index: number }[] {
  const parts = text.split(/(\s+)/);
  const tokens: { token: string; index: number }[] = [];
  let wordIndex = 0;
  for (const part of parts) {
    if (/\s+/.test(part)) {
      tokens.push({ token: part, index: -1 });
    } else {
      tokens.push({ token: part, index: wordIndex });
      wordIndex++;
    }
  }
  return tokens;
}

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile|BlackBerry|IEMobile|Opera Mini/i.test(
    ua
  );
}

const FOOTER_HEIGHT = 96;
const LAST_MESSAGE_SPACING = 16;
const TOOLTIP_GAP_BELOW = 12;
const TOOLTIP_GAP_ABOVE = 6;

const AITalkPageDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const scenarioId = location.state?.scenarioId as number | undefined;

  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [scenarioTitle, setScenarioTitle] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [isRecording, setIsRecording] = useState(false);

  const [activeTooltipMsgId, setActiveTooltipMsgId] = useState<string | null>(
    null
  );
  const [activeTooltipWordIndexes, setActiveTooltipWordIndexes] = useState<
    number[]
  >([]);
  const [cardPos, setCardPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    preferAbove: false,
  });
  const bubbleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = isMobileUA();

  useEffect(() => {
    if (!scenarioId) {
      navigate("/ai-talk", { replace: true });
      return;
    }

    const scenarioKey = String(scenarioId) as keyof typeof STATIC_SCENARIOS;
    const scenario = STATIC_SCENARIOS[scenarioKey] || STATIC_SCENARIOS["1"];

    setScenarioTitle(scenario.title);
    setMessages(buildDummyMessages(scenario.initialMessage));
  }, [scenarioId, navigate]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    setTimeout(() => {
      el.scrollTo({
        top: Math.max(0, el.scrollHeight - LAST_MESSAGE_SPACING),
        behavior: "smooth",
      });
    }, 100);
  }, [messages]);

  const toggleRecording = () => {
    if (isRecording) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${prev.length}`,
          role: "user",
          content: "Just a dummy user message for testing.",
          timestamp: new Date(),
        },
        {
          id: `ai-${prev.length + 1}`,
          role: "ai",
          content: "Thank you. This is a dummy AI response.",
          timestamp: new Date(),
        },
      ]);
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  const handleEndConversation = () => {
    navigate("/ai-talk");
  };

  const playAIVoice = (text: string) =>
    console.log("[v0] Playing AI voice:", text);
  const translateText = (text: string) =>
    console.log("[v0] Translating AI text:", text);

  function isWordErrored(index: number, feedback?: FeedbackPayload) {
    if (!feedback) return { errored: false, kind: null as ErrorType | null };
    for (const e of feedback.errors) {
      if (e.type !== "style" && e.index === index) {
        return { errored: true, kind: e.type };
      }
    }
    return { errored: false, kind: null as ErrorType | null };
  }

  function hasStyleError(feedback?: FeedbackPayload) {
    return Boolean(feedback?.errors.find((e) => e.type === "style"));
  }

  const getHeaderHeight = useCallback(() => {
    const el = headerRef.current;
    if (!el) return 64;
    return el.getBoundingClientRect().height;
  }, []);

  const [listHeight, setListHeight] = useState<string>("calc(100vh - 160px)");
  const adjustLayout = useCallback(() => {
    const headerH = getHeaderHeight();
    const footerH = FOOTER_HEIGHT;
    setListHeight(`calc(100vh - ${headerH + footerH}px)`);
  }, [getHeaderHeight]);

  useEffect(() => {
    adjustLayout();
    window.addEventListener("resize", adjustLayout);
    return () => window.removeEventListener("resize", adjustLayout);
  }, [adjustLayout]);

  const updateCardPosition = useCallback((msgId: string) => {
    const node = bubbleRefs.current[msgId];
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const desiredWidth = Math.min(rect.width, viewportW * 0.92);
    const center = rect.left + rect.width / 2;
    let left = center - desiredWidth / 2;
    left = Math.max(8, Math.min(left, viewportW - desiredWidth - 8));
    const estimatedCardHeight = 180;
    const safeBottom = FOOTER_HEIGHT + 8;
    const spaceBelow = viewportH - rect.bottom - safeBottom;
    const spaceAbove = rect.top;
    let preferAbove = false;
    let top: number;

    if (spaceBelow >= estimatedCardHeight + TOOLTIP_GAP_BELOW) {
      // 아래 공간 충분
      top = rect.bottom + TOOLTIP_GAP_BELOW;
      preferAbove = false;
    } else if (spaceAbove >= estimatedCardHeight + TOOLTIP_GAP_ABOVE) {
      // 위 공간 충분
      preferAbove = true;
      // ✅ [수정] 말풍선 바로 위 좌표를 기준점으로 잡습니다.
      // (estimatedCardHeight를 빼지 않고, CSS transform으로 처리)
      top = rect.top - TOOLTIP_GAP_ABOVE;
    } else {
      preferAbove = spaceAbove >= spaceBelow;
      if (preferAbove) {
        // ✅ [수정] 공간 부족해도 위쪽 선호 시 기준점 동일하게 잡음
        top = rect.top - TOOLTIP_GAP_ABOVE;
      } else {
        const maxAllowedTop = Math.max(
          8,
          viewportH -
            safeBottom -
            Math.min(estimatedCardHeight, Math.max(0, spaceBelow))
        );
        top = Math.min(rect.bottom + TOOLTIP_GAP_BELOW, maxAllowedTop);
      }
    }
    setCardPos({ top, left, width: desiredWidth, preferAbove });
  }, []);

  function onWordInteract(
    msgId: string,
    wordIndex: number,
    feedback?: FeedbackPayload
  ) {
    if (!feedback) return;
    const errorsForWord = feedback.errors.filter((e) => e.index === wordIndex);
    if (errorsForWord.length === 0) return;
    setActiveTooltipMsgId(msgId);
    setActiveTooltipWordIndexes([wordIndex]);
    requestAnimationFrame(() => updateCardPosition(msgId));
  }

  function onSentenceInteract(msgId: string, feedback?: FeedbackPayload) {
    if (!feedback) return;
    if (!hasStyleError(feedback)) return;
    setActiveTooltipMsgId(msgId);
    setActiveTooltipWordIndexes([]);
    requestAnimationFrame(() => updateCardPosition(msgId));
  }

  function closeTooltip() {
    setActiveTooltipMsgId(null);
    setActiveTooltipWordIndexes([]);
  }

  useEffect(() => {
    function onResize() {
      if (activeTooltipMsgId) updateCardPosition(activeTooltipMsgId);
      adjustLayout();
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [activeTooltipMsgId, updateCardPosition, adjustLayout]);

  const memoizedTokens = useMemo(() => {
    const map: Record<string, { token: string; index: number }[]> = {};
    for (const m of messages) {
      if (m.role === "user") map[m.id] = tokenizeWithIndices(m.content);
      else map[m.id] = [{ token: m.content, index: -1 }];
    }
    return map;
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <header
        ref={headerRef}
        className="w-full bg-white flex-shrink-0 border-b border-gray-100"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-[19px] sm:text-[22px] font-semibold text-gray-900 truncate">
              {scenarioTitle}
            </h1>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleEndConversation}
              className="ml-3 inline-flex items-center gap-2 rounded-md bg-rose-50 text-rose-700 px-3 py-2 text-sm font-medium hover:bg-rose-100 shadow-sm"
            >
              대화 종료
            </button>
          </div>
        </div>
      </header>

      {/* 메시지 리스트 */}
      <main className="flex-1 overflow-hidden" aria-live="polite">
        <div
          ref={listRef}
          className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 overflow-y-auto flex flex-col gap-6"
          style={{
            minHeight: 0,
            height: listHeight,
            paddingBottom: LAST_MESSAGE_SPACING,
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === "user";
            const tokens = memoizedTokens[m.id];
            const styleError = hasStyleError(m.feedback);

            return (
              <div
                key={m.id}
                className={`relative flex items-start ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex-1 max-w-[88%] sm:max-w-[70%]">
                  <div
                    ref={(el) => {
                      bubbleRefs.current[m.id] = el;
                    }}
                    className={`rounded-xl px-3 py-2 text-[15px] sm:text-[18px] leading-snug break-words 
                      ${
                        isUser
                          ? "bg-rose-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      } 
                      ${styleError && isUser ? "ring-2 ring-yellow-300" : ""}`}
                    onMouseEnter={() => {
                      if (!isMobile && styleError && isUser)
                        onSentenceInteract(m.id, m.feedback);
                    }}
                    onMouseLeave={() => {
                      if (!isMobile) closeTooltip();
                    }}
                    onClick={() => {
                      if (isMobile && styleError && isUser)
                        onSentenceInteract(m.id, m.feedback);
                    }}
                  >
                    <div
                      className={`whitespace-pre-wrap break-words ${
                        styleError && isUser ? "bg-yellow-50/20" : ""
                      }`}
                    >
                      {isUser ? (
                        <span>
                          {tokens.map(({ token, index }, i) => {
                            if (index === -1)
                              return (
                                <span key={`${m.id}-ws-${i}`}>{token}</span>
                              );
                            const { errored, kind } = isWordErrored(
                              index,
                              m.feedback
                            );
                            const base = "rounded-sm px-0.5 inline-block";
                            const highlight =
                              kind === "word"
                                ? "bg-blue-600/30 underline decoration-2 underline-offset-2"
                                : kind === "grammar"
                                ? "bg-purple-600/30 underline decoration-dotted"
                                : kind === "spelling"
                                ? "bg-orange-500/30 underline decoration-wavy"
                                : "";
                            const clickable = errored ? "cursor-pointer" : "";

                            return (
                              <span
                                key={`${m.id}-w-${index}`}
                                className={`${base} ${highlight} ${clickable}`}
                                onMouseEnter={() => {
                                  if (!isMobile && errored)
                                    onWordInteract(m.id, index, m.feedback);
                                }}
                                onMouseLeave={() => {
                                  if (!isMobile) closeTooltip();
                                }}
                                onClick={() => {
                                  if (isMobile && errored)
                                    onWordInteract(m.id, index, m.feedback);
                                }}
                              >
                                {token}
                              </span>
                            );
                          })}
                        </span>
                      ) : (
                        <span>{m.content}</span>
                      )}
                    </div>

                    {m.role === "ai" && (
                      <div className="flex gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => playAIVoice(m.content)}
                          className="inline-flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <Volume2 size={18} />
                          <span className="sr-only">듣기</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => translateText(m.content)}
                          className="inline-flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <Languages size={18} />
                          <span className="sr-only">번역</span>
                        </button>
                      </div>
                    )}

                    {styleError && isUser && (
                      <div className="mt-2 flex items-center gap-2 text-yellow-900">
                        <AlertCircle size={16} />
                        <span className="text-[14px]">
                          문장 전체 스타일 개선 필요
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 하단 입력창 (푸터) */}
      <footer
        className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm z-40"
        style={{ height: FOOTER_HEIGHT }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-full flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={toggleRecording}
              aria-pressed={isRecording}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md ${
                isRecording ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
              }`}
              style={{ transform: "translateY(15px)" }}
            >
              <Mic size={30} />
              {isRecording && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "0 0 0 0 rgba(244, 63, 94, 0.4)",
                    animation: "ringPulse 1.8s ease-out infinite",
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </footer>

      <FloatingFeedbackCard
        show={Boolean(activeTooltipMsgId)}
        top={cardPos.top}
        left={cardPos.left}
        width={cardPos.width}
        onClose={closeTooltip}
        mobile={isMobile}
        feedback={messages.find((mm) => mm.id === activeTooltipMsgId)?.feedback}
        activeWordIndexes={activeTooltipWordIndexes}
        // ✅ [추가] 위쪽 배치 여부 전달
        isAbove={cardPos.preferAbove}
      />

      <style>
        {`
          @keyframes ringPulse {
            0%   { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.40); }
            70%  { box-shadow: 0 0 0 14px rgba(244, 63, 94, 0.00); }
            100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.00); }
          }
        `}
      </style>
    </div>
  );
};

export default AITalkPageDetail;
