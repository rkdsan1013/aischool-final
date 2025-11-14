// src/pages/AITalkPageDetail.tsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { Mic, Volume2, Languages, AlertCircle } from "lucide-react";
import FloatingFeedbackCard from "../components/FloatingFeedbackCard";
import type {
  FeedbackPayload,
  ErrorType,
} from "../components/FloatingFeedbackCard";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  feedback?: FeedbackPayload;
};

type Props = {
  scenarioId?: string;
  onBack?: () => void;
};

const scenarioData: Record<
  string,
  { title: string; initialMessage: string; context: string }
> = {
  cafe: {
    title: "카페에서 주문하기",
    initialMessage:
      "Hello! Welcome to our coffee shop. What can I get for you today?",
    context: "You are a friendly barista at a coffee shop.",
  },
  shopping: {
    title: "쇼핑하기",
    initialMessage: "Hi there! Are you looking for something specific today?",
    context: "You are a helpful sales assistant.",
  },
  interview: {
    title: "면접 연습",
    initialMessage:
      "Good morning! Thank you for coming in today. Please tell me about yourself.",
    context: "You are a hiring manager conducting an interview.",
  },
  travel: {
    title: "여행 대화",
    initialMessage: "Welcome! How can I help you with your travel plans today?",
    context: "You are a travel agent.",
  },
  study: {
    title: "학교 생활",
    initialMessage: "Hi! What class do you have next?",
    context: "You are a friendly classmate.",
  },
  free: {
    title: "자유 대화",
    initialMessage:
      "Hello! I'm your AI conversation partner. What would you like to talk about today?",
    context: "You are a friendly AI assistant ready to discuss any topic.",
  },
};

function buildDummyMessages(initial: string): Message[] {
  return [
    { id: "ai-0", role: "ai", content: initial, timestamp: new Date() },
    {
      id: "user-1",
      role: "user",
      content: "He ain't coming to the meeting.",
      timestamp: new Date(),
      feedback: {
        errors: [
          {
            index: 1,
            word: "ain't",
            type: "word",
            message:
              "비표준적이고 구어체적인 표현으로 공식적인 문맥에서는 적절하지 않음",
          },
        ],
        explanation: "공식적 맥락에서는 'isn't' 또는 'is not'을 사용합니다.",
        suggestion: "He isn't coming to the meeting.",
      },
    },
    {
      id: "ai-1",
      role: "ai",
      content:
        "Thanks for letting me know. Is there a reason he can't make it?",
      timestamp: new Date(),
    },
    {
      id: "user-2",
      role: "user",
      content: "She go to the office every day.",
      timestamp: new Date(),
      feedback: {
        errors: [
          {
            index: 1,
            word: "go",
            type: "grammar",
            message: "주어 'She'에 맞게 현재형 동사에 -s 필요",
          },
        ],
        explanation: "3인칭 단수 주어에는 현재형 동사에 -s를 붙입니다.",
        suggestion: "She goes to the office every day.",
      },
    },
    {
      id: "ai-2",
      role: "ai",
      content: "Got it. What does she usually do there?",
      timestamp: new Date(),
    },
    {
      id: "user-3",
      role: "user",
      content: "I didn't recieve the email yet.",
      timestamp: new Date(),
      feedback: {
        errors: [
          {
            index: 3,
            word: "recieve",
            type: "spelling",
            message: "'receive'로 철자 수정 필요",
          },
        ],
        explanation: "'receive'가 올바른 철자입니다.",
        suggestion: "I didn't receive the email yet.",
      },
    },
    {
      id: "ai-3",
      role: "ai",
      content: "Thanks for the update. Would you like me to resend it?",
      timestamp: new Date(),
    },
    {
      id: "user-4",
      role: "user",
      content: "Yo, I'm like super into coding and stuff.",
      timestamp: new Date(),
      feedback: {
        errors: [
          {
            index: null,
            word: null,
            type: "style",
            message: "면접 맥락에서 지나치게 비격식적이고 모호한 표현",
          },
        ],
        explanation:
          "면접 상황에는 격식 있는 어휘와 구체적인 기술/경험을 제시하는 문장이 적절합니다.",
        suggestion:
          "I am highly interested in software development, particularly in building reliable web applications.",
      },
    },
    {
      id: "ai-4",
      role: "ai",
      content:
        "Could you share a recent project that demonstrates your skills?",
      timestamp: new Date(),
    },
    {
      id: "user-5",
      role: "user",
      content: "There is many oppurtunities in this company.",
      timestamp: new Date(),
      feedback: {
        errors: [
          {
            index: 1,
            word: "is",
            type: "grammar",
            message: "'opportunities'는 복수이므로 'are' 사용",
          },
          {
            index: 3,
            word: "oppurtunities",
            type: "spelling",
            message: "'opportunities'로 철자 수정",
          },
        ],
        explanation:
          "복수 명사에는 'are'를 사용하며 철자를 'opportunities'로 교정합니다.",
        suggestion: "There are many opportunities in this company.",
      },
    },
    {
      id: "ai-5",
      role: "ai",
      content:
        "Yes, we offer various roles across teams. Which area interests you most?",
      timestamp: new Date(),
    },
    {
      id: "user-6",
      role: "user",
      content: "Hey folks, gonna drop the report later, cool?",
      timestamp: new Date(),
      feedback: {
        errors: [
          {
            index: null,
            word: null,
            type: "style",
            message: "업무/이메일 문맥에서 과도한 비격식 표현",
          },
        ],
        explanation:
          "업무 커뮤니케이션에서는 격식 있는 표현과 명확한 시간 약속이 필요합니다.",
        suggestion:
          "Hello team, I will submit the report later today. Please let me know if that works.",
      },
    },
    {
      id: "ai-6",
      role: "ai",
      content:
        "Thanks for the update. Could you share the estimated time of submission?",
      timestamp: new Date(),
    },
  ];
}

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

const FOOTER_HEIGHT = 96; // 푸터 높이
const LAST_MESSAGE_SPACING = 16; // 마지막 메시지와 푸터 사이에 둘 여백
const TOOLTIP_GAP_BELOW = 12; // 툴팁이 아래에 있을 때 메시지와의 간격
const TOOLTIP_GAP_ABOVE = 6; // 툴팁이 위에 있을 때 메시지와의 간격(더 가깝게)

const AITalkPageDetail: React.FC<Props> = ({ scenarioId = "free", onBack }) => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const [activeTooltipMsgId, setActiveTooltipMsgId] = useState<string | null>(
    null
  );
  const [activeTooltipWordIndexes, setActiveTooltipWordIndexes] = useState<
    number[]
  >([]);
  const [cardPos, setCardPos] = useState<{
    top: number;
    left: number;
    width: number;
    preferAbove?: boolean;
  }>({ top: 0, left: 0, width: 0, preferAbove: false });
  const bubbleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = isMobileUA();

  const scenario = scenarioData[scenarioId] ?? scenarioData["free"];

  useEffect(() => {
    setMessages(buildDummyMessages(scenario.initialMessage));
  }, [scenarioId, scenario.initialMessage]);

  useEffect(() => {
    // 메시지 변경 시 마지막 메시지가 푸터에 딱 붙지 않도록 약간의 여백을 둠
    const el = listRef.current;
    if (!el) return;
    setTimeout(() => {
      // 스크롤 끝 위치에서 마지막 여백(LAST_MESSAGE_SPACING)만큼 위로 위치시킴
      el.scrollTo({
        top: Math.max(0, el.scrollHeight - LAST_MESSAGE_SPACING),
        behavior: "smooth",
      });
    }, 30);
  }, [messages]);

  const toggleRecording = () => setIsRecording((s) => !s);
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
    const el = listRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTo({
          top: Math.max(0, el.scrollHeight - LAST_MESSAGE_SPACING),
          behavior: "smooth",
        });
      }, 30);
    }
  }, [getHeaderHeight]);

  useEffect(() => {
    adjustLayout();
    const id = setTimeout(adjustLayout, 50);
    window.addEventListener("resize", adjustLayout);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", adjustLayout);
    };
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
      top = rect.bottom + TOOLTIP_GAP_BELOW;
      preferAbove = false;
    } else if (spaceAbove >= estimatedCardHeight + TOOLTIP_GAP_ABOVE) {
      top = rect.top - estimatedCardHeight - TOOLTIP_GAP_ABOVE;
      preferAbove = true;
    } else {
      preferAbove = spaceAbove >= spaceBelow;
      if (preferAbove) {
        top = Math.max(
          8,
          rect.top -
            Math.min(estimatedCardHeight, spaceAbove) -
            TOOLTIP_GAP_ABOVE
        );
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

  const handleEndConversation = () => {
    if (onBack) onBack();
    else window.history.back();
  };

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
      <header ref={headerRef} className="w-full bg-white flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-[19px] sm:text-[22px] font-semibold text-gray-900 truncate">
              {scenario.title}
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
                    className={`rounded-xl px-3 py-2 text-[15px] sm:text-[18px] leading-snug break-words ${
                      isUser
                        ? "bg-rose-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    } ${styleError && isUser ? "ring-2 ring-yellow-300" : ""}`}
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

      <footer
        className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm z-40"
        aria-hidden={false}
        style={{ height: FOOTER_HEIGHT }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-full flex items-center justify-center">
            <button
              type="button"
              onClick={toggleRecording}
              aria-pressed={isRecording}
              aria-label="record"
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
                    willChange: "box-shadow",
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
