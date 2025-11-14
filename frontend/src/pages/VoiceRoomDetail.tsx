// src/pages/VoiceRoomDetail.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Users,
  MessageSquare,
  Volume2,
  PhoneOff,
  AlertCircle,
} from "lucide-react";
import FloatingFeedbackCard from "../components/FloatingFeedbackCard";
import type {
  FeedbackPayload,
  ErrorType,
} from "../components/FloatingFeedbackCard";

/* ----------------------------- Types & helpers ----------------------------- */

interface Participant {
  id: string;
  name: string;
  isSpeaking: boolean;
  speakingTime: number;
  isMuted: boolean;
}

interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  feedback?: FeedbackPayload;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
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

// Minimal speech recognition types to avoid `any`
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
}
interface IWebkitSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

/* -------------------------------- Component -------------------------------- */

export default function VoiceRoomDetail(): React.ReactElement {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const recognitionRef = useRef<IWebkitSpeechRecognition | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const participantsRef = useRef<HTMLDivElement | null>(null);

  const [inputText, setInputText] = useState("");

  // shared card state
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
  }>({ top: 0, left: 0, width: 0 });
  const bubbleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isMobile = isMobileUA();

  // 푸터 높이 상수 (px) — 필요시 조정
  const FOOTER_HEIGHT = 92;

  // initial data
  useEffect(() => {
    setParticipants([
      {
        id: "1",
        name: "나",
        isSpeaking: false,
        speakingTime: 0,
        isMuted: false,
      },
      {
        id: "2",
        name: "김영희",
        isSpeaking: false,
        speakingTime: 45,
        isMuted: false,
      },
      {
        id: "3",
        name: "이철수",
        isSpeaking: false,
        speakingTime: 32,
        isMuted: false,
      },
      {
        id: "4",
        name: "박민수",
        isSpeaking: false,
        speakingTime: 28,
        isMuted: false,
      },
    ]);

    setTranscript([
      {
        id: "1",
        speaker: "김영희",
        text: "Hi everyone! How are you doing today?",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: "2",
        speaker: "나",
        text: "I'm doing great, thanks! How about you?",
        timestamp: new Date(Date.now() - 240000),
        feedback: {
          errors: [],
          explanation: "자연스러운 응답이에요.",
          suggestion: "I'm doing great, thanks! How about you?",
        },
      },
      {
        id: "3",
        speaker: "이철수",
        text: "I had a wonderful weekend. I went hiking with my friends.",
        timestamp: new Date(Date.now() - 180000),
      },
      {
        id: "4",
        speaker: "나",
        text: "He ain't coming to the meeting.",
        timestamp: new Date(Date.now() - 120000),
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
        id: "5",
        speaker: "나",
        text: "She go to the office every day.",
        timestamp: new Date(Date.now() - 90000),
        feedback: {
          errors: [
            {
              index: 1,
              word: "go",
              type: "grammar",
              message: "3인칭 단수 주어에는 현재형 동사에 -s 필요",
            },
          ],
          explanation: "주어가 She일 때 동사는 goes가 됩니다.",
          suggestion: "She goes to the office every day.",
        },
      },
      {
        id: "6",
        speaker: "나",
        text: "I didn't receive the email yet.",
        timestamp: new Date(Date.now() - 60000),
        feedback: {
          errors: [
            {
              index: 3,
              word: "receive",
              type: "spelling",
              message: "'receive'로 철자 수정 필요",
            },
          ],
          explanation: "'receive'가 올바른 철자입니다.",
          suggestion: "I didn't receive the email yet.",
        },
      },
      {
        id: "7",
        speaker: "나",
        text: "Yo, I'm like super into coding and stuff.",
        timestamp: new Date(),
        feedback: {
          errors: [
            {
              index: null,
              word: null,
              type: "style",
              message: "면접/격식 문맥에서 지나치게 비격식적이고 모호한 표현",
            },
          ],
          explanation: "격식 있는 어휘와 구체성을 높여 표현해 보세요.",
          suggestion:
            "I am highly interested in software development, particularly in building reliable web applications.",
        },
      },
    ]);

    const t = setInterval(() => setSessionTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // STT simulation
  useEffect(() => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => IWebkitSpeechRecognition;
    };
    if (typeof window !== "undefined" && w.webkitSpeechRecognition) {
      if (!recognitionRef.current) {
        const recognition = new w.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setParticipants((prev) =>
            prev.map((p) => (p.id === "1" ? { ...p, isSpeaking: true } : p))
          );
        };

        recognition.onend = () => {
          setParticipants((prev) =>
            prev.map((p) => (p.id === "1" ? { ...p, isSpeaking: false } : p))
          );
          if (!isMuted && isConnected) {
            setTimeout(() => {
              try {
                recognition.start();
              } catch {
                // intentionally empty
              }
            }, 200);
          }
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;
          if (event.results[last].isFinal) {
            const newTranscript: TranscriptItem = {
              id: Date.now().toString(),
              speaker: "나",
              text,
              timestamp: new Date(),
              feedback:
                text.length > 20
                  ? {
                      errors: [],
                      explanation: "발음이 자연스러워요.",
                      suggestion: text,
                    }
                  : undefined,
            };
            setTranscript((prev) => [...prev, newTranscript]);
          }
        };

        recognitionRef.current = recognition;
      }

      try {
        if (isConnected && !isMuted && recognitionRef.current)
          recognitionRef.current.start();
      } catch {
        // intentionally empty
      }
    }

    const speakingInterval = setInterval(() => {
      const other = ["2", "3", "4"];
      const rand = other[Math.floor(Math.random() * other.length)];
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === rand
            ? { ...p, isSpeaking: true }
            : p.id !== "1"
            ? { ...p, isSpeaking: false }
            : p
        )
      );
      setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === rand ? { ...p, isSpeaking: false } : p))
        );
      }, 2000 + Math.random() * 3000);
    }, 5000);

    return () => {
      clearInterval(speakingInterval);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onstart = null;
          recognitionRef.current.stop();
        } catch {
          // intentionally empty
        }
        recognitionRef.current = null;
      }
    };
  }, [isConnected, isMuted]);

  // keep scroll bottom
  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript.length]);

  const toggleMute = () => {
    setIsMuted((s) => {
      const newMuted = !s;
      const rec = recognitionRef.current;
      if (rec) {
        try {
          if (newMuted) rec.stop();
          else if (isConnected) rec.start();
        } catch {
          // intentionally empty
        }
      }
      return newMuted;
    });
  };

  const handleLeaveRoom = () => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // intentionally empty
      }
    }
    setIsConnected(false);
    navigate("/voiceroom");
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const newTranscript: TranscriptItem = {
      id: Date.now().toString(),
      speaker: "나",
      text,
      timestamp: new Date(),
    };
    setTranscript((prev) => [...prev, newTranscript]);
    setInputText("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // helpers
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

  // card position (clamped to viewport)
  const updateCardPosition = useCallback((msgId: string) => {
    const node = bubbleRefs.current[msgId];
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const margin = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const desiredWidth = Math.min(rect.width, viewportW * 0.92);
    const center = rect.left + rect.width / 2;
    let left = center - desiredWidth / 2;
    left = Math.max(8, Math.min(left, viewportW - desiredWidth - 8));

    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const cardHeightEstimate = 160;

    let top: number;
    if (spaceBelow >= cardHeightEstimate + margin) {
      top = rect.bottom + margin;
    } else if (spaceAbove >= cardHeightEstimate + margin) {
      top = Math.max(8, rect.top - cardHeightEstimate - margin);
    } else {
      top = Math.max(
        8,
        Math.min(rect.bottom + margin, viewportH - cardHeightEstimate - 8)
      );
    }

    setCardPos({ top, left, width: desiredWidth });

    const outOfView = rect.bottom < 0 || rect.top > viewportH;
    if (outOfView) {
      closeTooltip();
    }
  }, []);

  // interactions
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
    updateCardPosition(msgId);
  }

  function onSentenceInteract(msgId: string, feedback?: FeedbackPayload) {
    if (!feedback) return;
    if (!hasStyleError(feedback)) return;
    setActiveTooltipMsgId(msgId);
    setActiveTooltipWordIndexes([]); // style-only
    updateCardPosition(msgId);
  }

  function closeTooltip() {
    setActiveTooltipMsgId(null);
    setActiveTooltipWordIndexes([]);
  }

  useEffect(() => {
    function onScroll() {
      if (activeTooltipMsgId) updateCardPosition(activeTooltipMsgId);
    }
    function onResize() {
      if (activeTooltipMsgId) updateCardPosition(activeTooltipMsgId);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [activeTooltipMsgId, updateCardPosition]);

  // 레이아웃: AITalkPageDetail과 동일한 중앙 정렬 + 여백(max-w-4xl)
  return (
    <div className="min-h-screen h-screen w-screen overflow-hidden bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 flex-shrink-0">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm sm:text-base font-bold">
                  초보자 환영방
                </span>
                <span className="text-xs text-gray-600">
                  {participants.length}명 · {formatTime(sessionTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSpeakerOn((s) => !s)}
              className={`p-2.5 rounded-full flex items-center justify-center ${
                isSpeakerOn
                  ? "bg-rose-50 text-rose-600"
                  : "bg-gray-50 text-gray-500"
              } hover:brightness-95`}
              aria-pressed={isSpeakerOn}
              aria-label={isSpeakerOn ? "스피커 끄기" : "스피커 켜기"}
              title={isSpeakerOn ? "스피커 켜짐" : "스피커 꺼짐"}
              style={{ width: 40, height: 40 }}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-full flex items-center justify-center ${
                isMuted ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-700"
              } hover:brightness-95`}
              aria-pressed={isMuted}
              aria-label={isMuted ? "음소거 해제" : "음소거"}
              title={isMuted ? "마이크 음소거됨" : "마이크 음소거 아님"}
              style={{ width: 40, height: 40 }}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1 px-4.5 py-1.5 rounded-full bg-red-600 text-white text-sm hover:bg-red-700"
              aria-label="나가기"
              title="나가기"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <PhoneOff className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline">나가기</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main (centered content area) */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-0 flex-1 flex flex-col gap-4">
          {/* Participants strip */}
          <div className="w-full border-b border-gray-100">
            <div
              ref={participantsRef}
              className="flex gap-3 overflow-x-auto py-3 px-3 no-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {participants.map((p) => (
                <div key={p.id} className="flex-none w-20 text-center">
                  <div className="relative mx-auto w-14 h-14">
                    {p.isSpeaking && (
                      <div className="absolute inset-0 rounded-full ring-4 ring-rose-400 ring-opacity-60 animate-pulse" />
                    )}
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                        p.id === "1" ? "bg-rose-500" : "bg-gray-300"
                      }`}
                    >
                      {p.name.charAt(0)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-900 truncate">
                    {p.name}
                  </div>
                  {p.isMuted && (
                    <div className="text-xs text-gray-400 mt-1">Muted</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Transcript / Feedback */}
          <section className="flex-1 relative min-h-0">
            <div className="flex items-center justify-between px-1 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-bold">
                  실시간 자막 & AI 피드백
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-rose-600">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="font-medium">LIVE</span>
              </div>
            </div>

            {/* transcript 컨테이너: bottom을 FOOTER_HEIGHT로 띄워 푸터와 겹치지 않게 함.
                paddingBottom은 내부 여유만 주도록 작게 설정 (푸터와 붙어 보이게). */}
            <div
              ref={transcriptRef}
              className="absolute inset-x-0 top-[56px] overflow-y-auto px-3"
              style={{
                bottom: FOOTER_HEIGHT,
                paddingBottom: 12,
                background: "white",
              }}
            >
              {transcript.map((item) => {
                const isMe = item.speaker === "나";
                const tokens = isMe
                  ? tokenizeWithIndices(item.text)
                  : [{ token: item.text, index: -1 }];
                const styleError = hasStyleError(item.feedback);

                return (
                  <div
                    key={item.id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`w-full max-w-[90%] ${
                        isMe ? "items-end" : "items-start"
                      } flex flex-col gap-2`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isMe ? "flex-row-reverse justify-end" : ""
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-600">
                          {item.speaker}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.timestamp.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        ref={(el) => {
                          bubbleRefs.current[item.id] = el;
                        }}
                        className={`${
                          isMe
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        } rounded-2xl p-3 ${
                          styleError && isMe ? "ring-2 ring-yellow-300" : ""
                        }`}
                        onMouseEnter={() => {
                          if (!isMobile && styleError && isMe)
                            onSentenceInteract(item.id, item.feedback);
                        }}
                        onMouseLeave={() => {
                          if (!isMobile) closeTooltip();
                        }}
                        onClick={() => {
                          if (isMobile && styleError && isMe)
                            onSentenceInteract(item.id, item.feedback);
                        }}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {isMe ? (
                            <span>
                              {tokens.map(({ token, index }, i) => {
                                if (index === -1)
                                  return (
                                    <span key={`${item.id}-ws-${i}`}>
                                      {token}
                                    </span>
                                  );
                                const res = item.feedback
                                  ? isWordErrored(index, item.feedback)
                                  : {
                                      errored: false,
                                      kind: null as ErrorType | null,
                                    };
                                const base = "rounded-sm px-0.5 inline-block";
                                const highlight =
                                  res.kind === "word"
                                    ? "bg-blue-600/30 underline decoration-2 underline-offset-2"
                                    : res.kind === "grammar"
                                    ? "bg-purple-600/30 underline decoration-dotted"
                                    : res.kind === "spelling"
                                    ? "bg-orange-500/30 underline decoration-wavy"
                                    : "";

                                return (
                                  <span
                                    key={`${item.id}-w-${index}`}
                                    className={`${base} ${highlight} ${
                                      res.errored ? "cursor-pointer" : ""
                                    }`}
                                    onMouseEnter={() => {
                                      if (!isMobile && res.errored)
                                        onWordInteract(
                                          item.id,
                                          index,
                                          item.feedback
                                        );
                                    }}
                                    onMouseLeave={() => {
                                      if (!isMobile) closeTooltip();
                                    }}
                                    onClick={() => {
                                      if (isMobile && res.errored)
                                        onWordInteract(
                                          item.id,
                                          index,
                                          item.feedback
                                        );
                                    }}
                                  >
                                    {token}
                                  </span>
                                );
                              })}
                            </span>
                          ) : (
                            <span>{item.text}</span>
                          )}
                        </p>

                        {styleError && isMe && (
                          <div className="mt-2 flex items-center gap-2 text-yellow-900">
                            <AlertCircle size={16} />
                            <span className="text-[13px]">
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

            {/* 채팅 푸터: 푸터 내부 padding-bottom/외부 마진 제거하여 화면 바닥에 딱 붙게 함 */}
            <div
              className="absolute left-0 right-0 bottom-0 border-t border-gray-100 bg-white flex items-center"
              style={{ height: FOOTER_HEIGHT, padding: 0, boxShadow: "none" }}
            >
              <div className="max-w-4xl mx-auto w-full px-0 sm:px-6 flex items-center gap-3">
                <div className="flex-1">
                  <label htmlFor="voice-input" className="sr-only">
                    메시지 입력
                  </label>
                  <input
                    id="voice-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="메시지를 입력하세요..."
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                    aria-label="메시지 입력"
                  />
                </div>
                <button
                  onClick={handleSend}
                  className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md hover:bg-rose-600"
                  aria-label="전송"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FloatingFeedbackCard는 푸터 위에 떠야 하므로 컴포넌트 내부 또는 전역 CSS에서 z-index 처리 필요 */}
      <FloatingFeedbackCard
        show={Boolean(activeTooltipMsgId)}
        top={cardPos.top}
        left={cardPos.left}
        width={cardPos.width}
        onClose={closeTooltip}
        mobile={isMobile}
        feedback={transcript.find((t) => t.id === activeTooltipMsgId)?.feedback}
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
}

/* ------------------------------ End of file ------------------------------ */
