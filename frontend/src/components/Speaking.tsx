// src/components/Speaking.tsx
// (SpeakingListening.tsx에서 수정됨)
// cSpell:ignore MediaRecorder
import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Volume2 } from "lucide-react";

interface Props {
  prompt: string;
  // onSelect 및 options 제거됨
  onRecord?: (blob: Blob) => void;
  onToggleRecord?: (recording: boolean) => void;
}

/**
 * 데모 모드: 3초 후 자동 중지
 */
const Speaking: React.FC<Props> = ({ prompt, onRecord, onToggleRecord }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState("버튼을 눌러 녹음을 시작하세요");
  const timerRef = useRef<number | null>(null);

  const toggleRecording = () => {
    const next = !isRecording;
    setIsRecording(next);
    onToggleRecord?.(next);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (next) {
      // 녹음 시작 (데모)
      setStatusText("녹음 중... (3초 후 자동 중지)");

      // 데모: 3초 후 자동 중지
      timerRef.current = window.setTimeout(() => {
        setIsRecording(false);
        setStatusText("녹음 완료! (데모)");
        const blob = new Blob(["dummy audio"], { type: "audio/wav" }); // 더미 Blob
        onRecord?.(blob);
        onToggleRecord?.(false);
      }, 3000);
    } else {
      // 녹음 중지 (수동)
      setStatusText("녹음 중지됨.");
      const blob = new Blob(["dummy audio"], { type: "audio/wav" }); // 더미 Blob
      onRecord?.(blob);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 제목 및 설명 (수정됨) */}
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          말하기 연습
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          주어진 문장을 듣고 따라 말해보세요.
        </p>
      </div>

      {/* 프롬프트 카드 (디자인 조화: bg-gray-50) */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              따라 말할 문장
            </div>
            <div className="text-lg sm:text-xl font-medium text-foreground">
              {prompt}
            </div>
          </div>
          <button
            type="button"
            aria-label="문장 듣기"
            className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center transition-all hover:bg-rose-100 active:scale-95"
            onClick={() => alert("데모: 오디오 재생")} // 실제로는 오디오 재생 로직
          >
            <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* 듣기 선택지 (제거됨) */}

      {/* 녹음 컨트롤 영역 (디자인 조화: bg-white) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col items-center gap-4">
        {/* 녹음 버튼 */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isRecording
              ? "bg-red-500 text-white shadow-red-500/30 ring-4 ring-red-300 animate-pulse"
              : "bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600"
          }`}
          aria-label={isRecording ? "녹음 중지" : "녹음 시작"}
        >
          {isRecording ? (
            <Square className="w-8 h-8 sm:w-10 sm:h-10" fill="white" />
          ) : (
            <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </button>
        {/* 상태 텍스트 */}
        <div
          className={`text-base font-medium ${
            isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground"
          }`}
        >
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default Speaking;
