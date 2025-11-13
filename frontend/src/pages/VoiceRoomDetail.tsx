// src/pages/VoiceRoomDetail.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  ArrowLeft,
  Users,
  MessageSquare,
  Volume2,
  Check,
  Phone,
  PhoneOff,
} from "lucide-react";

// Participant 인터페이스
interface Participant {
  id: string;
  name: string;
  isSpeaking: boolean;
  speakingTime: number;
  isMuted: boolean;
}

// Transcript 아이템 인터페이스
interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: Date;
  feedback?: string;
}

// 초를 mm:ss 형식의 문자열로 변환
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function VoiceRoomDetail(): React.ReactElement {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // 통화 참여 여부
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // 스피커(오디오 출력) 토글
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const participantsRef = useRef<HTMLDivElement | null>(null);

  // 입력 상태
  const [inputText, setInputText] = useState("");

  // 초기 데이터 및 타이머
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
        feedback:
          "Great pronunciation! Your intonation is natural. 발음이 정확하고 억양이 자연스러워요.",
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
        text: "That sounds amazing! Where did you go hiking?",
        timestamp: new Date(Date.now() - 120000),
        feedback:
          "Good job! Consider using 'That sounds fantastic' for more variety. 다양한 표현을 사용해보세요.",
      },
      {
        id: "5",
        speaker: "박민수",
        text: "I love hiking too! It's such a great way to relax and enjoy nature.",
        timestamp: new Date(Date.now() - 60000),
      },
    ]);

    const t = setInterval(() => setSessionTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // STT 및 다른 참가자 시뮬레이션
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).webkitSpeechRecognition
    ) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
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
              } catch {}
            }, 200);
          }
        };

        recognition.onresult = (event: any) => {
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
                  ? "Good pronunciation! 발음이 정확해요."
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
      } catch {}
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
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [isConnected, isMuted]);

  // 새 자막 추가 시 스크롤 하단 유지
  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [transcript.length]);

  const toggleMute = () => {
    setIsMuted((s) => {
      const newMuted = !s;
      if (recognitionRef.current) {
        try {
          if (newMuted) recognitionRef.current.stop();
          else if (isConnected) recognitionRef.current.start();
        } catch {}
      }
      return newMuted;
    });
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn((s) => !s);
    // 실제 오디오 출력 라우팅 변경은 여기서 구현
  };

  const handleLeaveRoom = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsConnected(false);
    navigate("/voiceroom");
  };

  const handleJoinCall = () => {
    setIsConnected(true);
    // 재연결 시 STT 재시작 시도
    if (recognitionRef.current && !isMuted) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  // 뒤로 가기 (ArrowLeft) 처리: 방 나가기와 동일하게 동작시킴
  const handleBack = () => {
    handleLeaveRoom();
  };

  // 사용자가 푸터에서 텍스트 전송
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    const newTranscript: TranscriptItem = {
      id: Date.now().toString(),
      speaker: "나",
      text,
      timestamp: new Date(),
      feedback:
        text.length > 20 ? "Good pronunciation! 발음이 정확해요." : undefined,
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

  return (
    // 전체 화면 고정, 페이지 자체 스크롤 차단
    <div className="min-h-screen h-screen w-screen overflow-hidden bg-white text-gray-900 flex flex-col">
      {/* Header: 모바일 우선 - 아이콘들을 동그라미 박스에 넣어 배경과 구분 */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleBack}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-md"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

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

        {/* Header 오른쪽: 각 아이콘을 동그라미 박스에 넣어 배경과 구분 */}
        <div className="flex items-center gap-2.5">
          {/* 스피커 토글 (원형 박스) */}
          <button
            onClick={toggleSpeaker}
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

          {/* 음소거 토글 (원형 박스) */}
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

          {/* 통화 참여 / 끊기 (원형 박스 + 텍스트) */}
          {isConnected ? (
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm hover:bg-red-700"
              aria-label="통화 끊기"
              title="통화 끊기"
            >
              <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center">
                <PhoneOff className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline">나가기</span>
            </button>
          ) : (
            <button
              onClick={handleJoinCall}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500 text-white text-sm hover:bg-rose-600"
              aria-label="통화 참여"
              title="통화 참여"
            >
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:inline">참여</span>
            </button>
          )}
        </div>
      </header>

      {/* Main: 모바일에서는 참가자(가로 스크롤) -> 자막(완전 채움) 순서.
          participants와 transcript 각각에서만 스크롤 허용 */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Participants strip (가로 스크롤, 모바일 우선) */}
        <div className="w-full border-b border-gray-100 flex-shrink-0">
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
                      p.id === "1" ? "bg-rose-500" : "bg-blue-500"
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

        {/* Transcript / Feedback: 화면을 꽉 채우고 내부에서 스크롤 */}
        <section className="flex-1 relative min-h-0">
          {/* 상단 툴바 (고정 높이) */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold">실시간 자막 & AI 피드백</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-rose-600">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              <span className="font-medium">LIVE</span>
            </div>
          </div>

          {/* 자막 스크롤 영역 (이 영역에서만 스크롤 발생) */}
          <div
            ref={transcriptRef}
            className="absolute inset-x-0 top-[56px] bottom-0 overflow-y-auto px-3 py-4 bg-white"
          >
            {transcript.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.speaker === "나" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`w-full max-w-[90%] ${
                    item.speaker === "나" ? "items-end" : "items-start"
                  } flex flex-col gap-2`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      item.speaker === "나"
                        ? "flex-row-reverse justify-end"
                        : ""
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
                    className={`${
                      item.speaker === "나"
                        ? "bg-rose-500 text-white rounded-2xl p-3"
                        : "bg-gray-100 text-gray-900 rounded-2xl p-3"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{item.text}</p>
                  </div>

                  {item.feedback && item.speaker === "나" && (
                    <div className="flex items-start gap-3 mt-1 bg-green-50 border border-green-200 rounded-xl p-3 max-w-full">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-green-700 leading-relaxed">
                        {item.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 바닥 여백 확보 (입력 바 높이와 겹치지 않도록) */}
            <div style={{ height: 88 }} />
          </div>

          {/* 입력/행동 패널 (고정 하단) */}
          <div className="absolute left-0 right-0 bottom-0 px-3 py-3 border-t border-gray-100 bg-white flex items-center gap-3">
            {/* 텍스트 입력 (전체 너비에서 send 버튼 제외한 부분 차지) */}
            <div className="flex-1">
              <label htmlFor="voice-input" className="sr-only">
                메시지 입력
              </label>
              <input
                id="voice-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Say something... (or type here)"
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
                aria-label="메시지 입력"
              />
            </div>

            {/* Send 버튼 */}
            <button
              onClick={handleSend}
              className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md hover:bg-rose-600"
              aria-label="전송"
            >
              <SendIcon size={18} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * 작은 Send 아이콘 컴포넌트 (크기 prop 추가).
 */
function SendIcon({ size = 18 }: { size?: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
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
  );
}
