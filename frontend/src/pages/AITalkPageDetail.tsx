import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { Mic, Volume2, Languages, AlertCircle } from "lucide-react";
// ✅ [중요] 백엔드 데이터 타입(AIFeedback)을 import하여 any 제거
import { aiTalkService, type AIFeedback } from "../services/aiTalkService";
import FloatingFeedbackCard, {
  type FeedbackPayload,
  type ErrorType,
} from "../components/FloatingFeedbackCard";

// 프론트엔드 표시용 메시지 타입
type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  feedback?: FeedbackPayload;
};

// ✅ URL 파라미터가 아닌 부모로부터 ID를 받음 (SPA 방식)
type Props = {
  scenarioId: number;
  onBack: () => void;
};

// ✅ [핵심] 백엔드 피드백 데이터를 프론트엔드 포맷으로 변환 (any 제거됨)
const transformFeedback = (
  backendFeedbackData: AIFeedback["feedback_data"]
): FeedbackPayload | undefined => {
  if (!backendFeedbackData) return undefined;

  return {
    explanation: backendFeedbackData.explanation,
    suggestion: backendFeedbackData.suggestion,
    errors: backendFeedbackData.errors.map((e) => ({
      index: e.index ?? null, // undefined -> null 변환 (TypeScript 에러 해결)
      word: e.word ?? null,
      type: e.type as ErrorType,
      message: e.message,
    })),
  };
};

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

const AITalkPageDetail: React.FC<Props> = ({ scenarioId, onBack }) => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [scenarioTitle, setScenarioTitle] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRecording, setIsRecording] = useState(false);

  // 툴팁 관련 상태
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

  // ✅ 초기 세션 로드 (scenarioId 변경 시 실행)
  useEffect(() => {
    if (!scenarioId) return;

    const initSession = async () => {
      try {
        setIsLoading(true);

        // 1. 시나리오 정보 가져오기 (제목 표시용)
        const scenarioData = await aiTalkService.getScenarioById(scenarioId);
        setScenarioTitle(scenarioData.title);

        // 2. 대화 세션 시작 (첫 인사말 가져오기)
        const { session, initialMessages } = await aiTalkService.startSession(
          scenarioId
        );
        setSessionId(session.session_id);

        // 3. 메시지 포맷 변환 및 적용
        const formattedMessages: Message[] = initialMessages.map((m) => ({
          id: String(m.message_id),
          role: m.sender_role,
          content: m.content,
          timestamp: new Date(m.created_at),
          audioUrl: m.audio_url,
          // 백엔드 데이터 변환 적용
          feedback: m.feedback
            ? transformFeedback(m.feedback.feedback_data)
            : undefined,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("세션 시작 실패:", error);
        alert("대화를 시작할 수 없습니다.");
        onBack(); // 실패 시 목록으로 복귀
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [scenarioId, onBack]);

  // 자동 스크롤
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

  // --- 메시지 전송 로직 ---
  const handleSendMessage = async (text: string) => {
    if (!sessionId || !text.trim()) return;

    // 임시 메시지 추가 (Optimistic UI)
    const tempId = "temp-" + Date.now();
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // API 호출
      const response = await aiTalkService.sendMessage(sessionId, text);

      const serverUserMsg = response.userMessage;
      const serverAiMsg = response.aiMessage;

      // 실제 서버 데이터로 교체
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        {
          id: String(serverUserMsg.message_id),
          role: "user",
          content: serverUserMsg.content,
          timestamp: new Date(serverUserMsg.created_at),
          feedback: serverUserMsg.feedback
            ? transformFeedback(serverUserMsg.feedback.feedback_data)
            : undefined,
        },
        {
          id: String(serverAiMsg.message_id),
          role: "ai",
          content: serverAiMsg.content,
          timestamp: new Date(serverAiMsg.created_at),
          audioUrl: serverAiMsg.audio_url,
        },
      ]);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // TODO: 실제 녹음 중지 및 STT 처리 후 handleSendMessage 호출
      setIsRecording(false);
      handleSendMessage("Hello, I would like to order an iced americano."); // 테스트용 더미 메시지
    } else {
      setIsRecording(true);
    }
  };

  // --- UI 헬퍼 함수들 ---
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

  const memoizedTokens = useMemo(() => {
    const map: Record<string, { token: string; index: number }[]> = {};
    for (const m of messages) {
      if (m.role === "user") map[m.id] = tokenizeWithIndices(m.content);
      else map[m.id] = [{ token: m.content, index: -1 }];
    }
    return map;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        대화 세션을 불러오는 중입니다...
      </div>
    );
  }

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
              onClick={onBack}
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
