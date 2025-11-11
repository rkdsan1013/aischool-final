// src/pages/VoiceRoomDetail.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Phone,
  Users,
  MessageSquare,
  Volume2,
  Clock,
  X,
  Check, // [ADDED] AI 피드백 아이콘
} from "lucide-react";

// Participant 인터페이스
interface Participant {
  id: string;
  name: string;
  isSpeaking: boolean;
  speakingTime: number; // 이 속성은 현재 UI에서 사용되지 않지만 구조상 유지
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
  const [isConnected, setIsConnected] = useState(true); // [CHANGED] 기본값을 true (연결된 상태)로 변경
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const recognitionRef = useRef<any>(null); // Web Speech API 인스턴스

  // 컴포넌트 마운트 시 참가자, 대화 내용, 세션 타이머 초기화
  useEffect(() => {
    // 목업 참가자 데이터 설정
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

    // 목업 대화 내용 설정
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

    // 세션 시간 증가 타이머
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Web Speech API 및 다른 참가자 발언 시뮬레이션
  useEffect(() => {
    // Web Speech API (STT) 초기화
    if (
      typeof window !== "undefined" &&
      (window as any).webkitSpeechRecognition
    ) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // 계속 음성 인식
      recognition.interimResults = true; // 중간 결과 반환
      recognition.lang = "en-US"; // 영어로 설정

      // 인식 시작
      recognition.onstart = () => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === "1" ? { ...p, isSpeaking: true } : p))
        );
      };

      // 인식 종료
      recognition.onend = () => {
        setParticipants((prev) =>
          prev.map((p) => (p.id === "1" ? { ...p, isSpeaking: false } : p))
        );
      };

      // 인식 결과 처리
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        if (event.results[last].isFinal) {
          // 최종 결과일 때
          const newTranscript: TranscriptItem = {
            id: Date.now().toString(),
            speaker: "나",
            text,
            timestamp: new Date(),
            // 간단한 목업 피드백
            feedback:
              text.length > 20
                ? "Good pronunciation! 발음이 정확해요."
                : undefined,
          };
          setTranscript((prev) => [...prev, newTranscript]);
        }
      };

      recognitionRef.current = recognition;
      // 페이지 로드 시 음성 인식 시작 (연결 상태일 때)
      if (isConnected && !isMuted) {
        recognition.start();
      }
    }

    // 다른 참가자 발언 시뮬레이션
    const speakingInterval = setInterval(() => {
      const otherParticipants = ["2", "3", "4"]; // '나'를 제외한 ID
      const randomParticipant =
        otherParticipants[Math.floor(Math.random() * otherParticipants.length)];

      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === randomParticipant) {
            return { ...p, isSpeaking: true }; // 랜덤 참가자 발언 시작
          }
          return p.id !== "1" ? { ...p, isSpeaking: false } : p; // '나' 제외하고 모두 false
        })
      );

      // 일정 시간 후 발언 종료
      setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === randomParticipant ? { ...p, isSpeaking: false } : p
          )
        );
      }, 2000 + Math.random() * 3000);
    }, 5000); // 5초마다 시뮬레이션

    return () => clearInterval(speakingInterval);
  }, [isConnected, isMuted]); // isConnected, isMuted 상태 변경 시 재설정

  // 마이크 음소거 토글
  const toggleMute = () => {
    setIsMuted((s) => {
      const newMuted = !s;
      if (recognitionRef.current) {
        if (newMuted) {
          recognitionRef.current.stop(); // 음소거 시 STT 중지
        } else if (isConnected) {
          recognitionRef.current.start(); // 음소거 해제 시 STT 시작
        }
      }
      return newMuted;
    });
  };

  // 방 나가기 (연결 종료)
  const handleLeaveRoom = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // STT 중지
    }
    setIsConnected(false); // 연결 상태 false
    navigate("/voiceroom"); // 이전 페이지로 이동
  };

  return (
    // [STYLE] 전체 레이아웃: h-screen, flex-col, bg-gray-50 (일관성)
    <div className="h-screen flex flex-col bg-white text-gray-900 font-sans overflow-hidden">
      {/* Header: 방 정보 및 컨트롤 버튼 */}
      <header className="border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
        {/* [STYLE] max-w-5xl, mx-auto, px-4 sm:px-6 (일관성) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Room Info */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  초보자 환영방
                </h1>
                <p className="text-xs text-gray-600">{participants.length}명</p>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* 세션 시간 */}
              <div className="hidden sm:flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-200">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {formatTime(sessionTime)}
                </span>
              </div>
              {/* 마이크 버튼 */}
              <button
                onClick={toggleMute}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                aria-label={isMuted ? "마이크 켜기" : "마이크 끄기"}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              {/* 볼륨 버튼 (기능 없음) */}
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all shadow-sm"
                aria-label="볼륨 조절"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {/* 나가기 버튼 */}
              <button
                onClick={handleLeaveRoom}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 flex items-center justify-center transition-all shadow-md active:scale-95 text-white"
                aria-label="방 나가기"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 rotate-135 transition-transform" />
              </button>
              {/* 닫기 (X) 버튼 (나가기와 동일한 기능) */}
              <button
                onClick={handleLeaveRoom}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: 참가자 및 대화 내용 */}
      <main className="flex-1 overflow-hidden">
        {/* [STYLE] max-w-5xl, mx-auto, h-full, p-4 sm:p-6 (일관성) */}
        <div className="max-w-5xl mx-auto h-full p-4 sm:p-6">
          {/* [STYLE] gap-4 sm:gap-6 (일관성) */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 h-full">
            {/* Left column - participants */}
            {/* [STYLE] h-auto lg:h-full (반응형 높이) */}
            <section className="lg:col-span-1 h-auto lg:h-full flex-shrink-0">
              {/* [STYLE] 카드 스타일: bg-white, rounded-2xl, p-4 sm:p-6, border-2, h-full, flex-col (일관성) */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 h-full flex flex-col">
                {/* [STYLE] 섹션 제목: text-xl sm:text-2xl, mb-4 sm:mb-6 (일관성) */}
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                  {`참가자 (${participants.length})`}
                </h2>
                {/* [STYLE] 참가자 목록: 모바일(flex, overflow-x), 데스크탑(grid, overflow-y) */}
                <div className="flex lg:grid lg:grid-cols-1 gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex-shrink-0 w-24 lg:w-full"
                    >
                      {/* [STYLE] 참가자 개별 카드 (nested) */}
                      <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-xl border bg-gray-50 border-gray-200">
                        <div className="relative w-12 h-12 lg:w-12 lg:h-12 flex-shrink-0">
                          {/* 발언 시 애니메이션 */}
                          {participant.isSpeaking && (
                            <div className="absolute inset-0 rounded-full ring-4 ring-rose-400 ring-opacity-70 animate-pulse" />
                          )}
                          <div
                            className={`w-full h-full rounded-full flex items-center justify-center font-bold text-base lg:text-lg text-white shadow-md ${
                              participant.id === "1"
                                ? "bg-rose-500" // '나'
                                : "bg-blue-500" // '다른 사람'
                            }`}
                          >
                            {participant.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 text-center lg:text-left min-w-0">
                          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-1 lg:gap-2">
                            <h3 className="font-semibold text-xs lg:text-base text-gray-900 truncate">
                              {participant.name}
                            </h3>
                            {/* 음소거 아이콘 */}
                            {participant.isMuted && (
                              <MicOff className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Right column - transcript + feedback */}
            {/* [STYLE] h-full 보장 (flex-1, min-h-0) */}
            <section className="lg:col-span-2 flex-1 overflow-hidden min-h-0 h-full">
              {/* [STYLE] 카드 스타일: bg-white, rounded-2xl, p-4 sm:p-6, border-2, h-full, flex-col (일관성) */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-gray-200 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                  {/* [STYLE] 섹션 제목: text-xl sm:text-2xl (일관성) */}
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                    <span className="hidden sm:inline">
                      실시간 자막 & AI 피드백
                    </span>
                    <span className="sm:hidden">실시간 자막</span>
                  </h2>
                  {/* LIVE 뱃지 */}
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs sm:text-sm border border-rose-200">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-500 rounded-full animate-pulse" />
                    <span className="font-medium">LIVE</span>
                  </div>
                </div>
                {/* [STYLE] 대화 내용: flex-1, overflow-y-auto */}
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2">
                  {transcript.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${
                        item.speaker === "나" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] ${
                          item.speaker === "나" ? "items-end" : "items-start"
                        } flex flex-col gap-1`}
                      >
                        {/* 발언자 및 시간 */}
                        <div
                          className={`flex items-center gap-1.5 sm:gap-2 px-2 ${
                            item.speaker === "나" ? "flex-row-reverse" : ""
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
                        {/* 말풍선 */}
                        <div
                          className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ${
                            item.speaker === "나"
                              ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-br-sm"
                              : "bg-gray-100 text-gray-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="leading-relaxed">{item.text}</p>
                        </div>
                        {/* AI 피드백 ( '나'의 발언에만 표시) */}
                        {item.feedback && item.speaker === "나" && (
                          <div className="flex items-start gap-2 mt-1 p-2 sm:p-3 bg-green-50 border border-green-200 rounded-xl max-w-full">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </div>
                            <p className="text-xs leading-relaxed text-green-700">
                              {item.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
