// src/pages/AITalkPageDetail.tsx
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, Volume2, Languages } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  audioUrl?: string;
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

const AITalkPageDetail: React.FC<Props> = ({ scenarioId = "free", onBack }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const scenario = scenarioData[scenarioId] ?? scenarioData["free"];

  useEffect(() => {
    setMessages([
      {
        id: "ai-0",
        role: "ai",
        content: scenario.initialMessage,
        timestamp: new Date(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isSending]);

  const toggleRecording = () => {
    setIsRecording((s) => !s);
  };

  const playAIVoice = (text: string) => {
    console.log("[v0] Playing AI voice:", text);
  };

  const translateText = (text: string) => {
    console.log("[v0] Translating AI text:", text);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header (mobile-first) */}
      <header className="w-full bg-white flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : window.history.back())}
            aria-label="뒤로"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[19px] sm:text-[22px] font-semibold text-gray-900 truncate">
              {scenario.title}
            </h1>
            <p className="text-[15px] sm:text-[18px] text-gray-500 mt-0.5">
              AI와 대화 중
            </p>
          </div>
        </div>
      </header>

      {/* Messages (mobile-first widths, bottom padding to avoid overlap with footer) */}
      <main className="flex-1 overflow-hidden" aria-live="polite">
        <div
          ref={listRef}
          className="max-w-5xl mx-auto h-full px-4 sm:px-6 pt-4 pb-24 sm:pb-[104px] overflow-y-auto flex flex-col gap-4"
          style={{ minHeight: 0 }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex-1 max-w-[88%] sm:max-w-[70%]">
                <div
                  className={`rounded-xl px-3 py-2 text-[15px] sm:text-[18px] leading-snug break-words ${
                    m.role === "user"
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {/* 텍스트 */}
                  <div className="whitespace-pre-wrap break-words">
                    {m.content}
                  </div>

                  {/* 아이콘들: 텍스트 아래 줄로 배치 */}
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
                </div>
              </div>
            </div>
          ))}

          {/* AI 응답 대기 중 (점 애니메이션만 표시) */}
          {isSending && (
            <div className="flex items-start">
              <div className="max-w-[80%]">
                <div className="rounded-xl px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  <span
                    className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                    style={{ animationDelay: "200ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"
                    style={{ animationDelay: "400ms" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer: fixed, mobile-first, no divider, mic slightly lifted but centered */}
      <footer className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-20 sm:h-24 flex items-center justify-center">
            <button
              type="button"
              onClick={toggleRecording}
              aria-pressed={isRecording}
              aria-label="record"
              className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white shadow-md ${
                isRecording ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
              }`}
              style={{
                transform: "translateY(-15px)", // 살짝 위로 (~15px)
              }}
            >
              <Mic size={30} />
              {/* Safe ring animation using box-shadow (no layout growth) */}
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

      {/* Keyframes: ring via box-shadow only to avoid scroll and clipping */}
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
