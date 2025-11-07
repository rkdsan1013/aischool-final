// src/pages/AITalkPageDetail.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mic, Send, Volume2, User, Bot } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
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
  free: {
    title: "자유 대화",
    initialMessage:
      "Hello! I'm your AI conversation partner. What would you like to talk about today?",
    context: "You are a friendly AI assistant ready to discuss any topic.",
  },
  // 필요하면 더 추가
};

/* 간단한 인증 훅(프로젝트 인증으로 교체) */
function useAuth() {
  const [isLoading] = useState(false);
  const [user] = useState<{ id: string; name: string } | null>({
    id: "1",
    name: "Test",
  });
  return { user, isLoading };
}

const AITalkPageDetail: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const { user, isLoading } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const scenarioId = params.id ?? "free";
  const scenario = scenarioData[scenarioId] ?? scenarioData["free"];

  useEffect(() => {
    if (!isLoading && !user) navigate("/login");
  }, [user, isLoading, navigate]);

  useEffect(() => {
    setMessages([
      {
        id: "ai-0",
        role: "ai",
        content: scenario.initialMessage,
        timestamp: new Date(),
      },
    ]);
  }, [scenarioId, scenario.initialMessage]);

  useEffect(() => {
    // 새 메시지 추가 시 스크롤 맨 아래로
    const el = listRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isSending]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((p) => [...p, userMessage]);
    setInputValue("");
    setIsSending(true);

    // 모의 AI 응답 (실제 API 교체)
    setTimeout(() => {
      const aiResponses = [
        "That's great! Could you tell me more about that?",
        "I see. That's very interesting. What else would you like to share?",
        "Excellent! Your English is improving. Let's continue.",
        "Good job! Try to use more descriptive words next time.",
        "Perfect! That's exactly how you would say it in English.",
      ];
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
      };
      setMessages((p) => [...p, aiMessage]);
      setIsSending(false);
    }, 900);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => setIsRecording((s) => !s);

  if (isLoading || !user || !scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col  bg-white">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/ai-talk")}
            aria-label="뒤로"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {scenario.title}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">AI와 대화 중</p>
          </div>

          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-hidden" aria-live="polite">
        <div
          ref={listRef}
          className="max-w-4xl mx-auto h-full px-4 py-4 overflow-y-auto flex flex-col gap-4"
          style={{ minHeight: 0 }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 items-start ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  m.role === "user"
                    ? "bg-rose-500 text-white"
                    : "bg-indigo-500 text-white"
                }`}
                aria-hidden
              >
                {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div className="flex-1 max-w-[72%]">
                <div
                  className={`relative rounded-xl p-3 break-words text-sm ${
                    m.role === "user"
                      ? "bg-rose-500 text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.content}
                  </div>

                  {m.role === "ai" && (
                    <button
                      type="button"
                      onClick={() => {
                        /* TTS placeholder */
                      }}
                      className="absolute right-2 bottom-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      <Volume2 size={14} />
                      <span className="sr-only">듣기</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  {m.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="max-w-[72%]">
                <div className="rounded-xl p-3 bg-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce" />
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}
          {/* 스크롤 용 더미 끝 */}
          <div className="h-6" />
        </div>
      </main>

      {/* Input (fixed footer) */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleRecording}
            aria-pressed={isRecording}
            aria-label="record"
            className={`w-11 h-11 rounded-lg flex items-center justify-center text-white ${
              isRecording ? "bg-rose-600" : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            <Mic size={16} />
          </button>

          <input
            placeholder="메시지를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSending}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-rose-300"
            aria-label="메시지 입력"
          />

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            aria-label="send"
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
              !inputValue.trim() || isSending
                ? "bg-rose-200 cursor-not-allowed"
                : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            <Send size={16} />
            <span className="hidden sm:inline">전송</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AITalkPageDetail;
