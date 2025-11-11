// src/components/SpeakingListening.tsx
import React, { useState, useRef } from "react";

interface Props {
  prompt: string;
  options?: string[];
  onSelect?: (opt: string) => void;
  onRecord?: (blob: Blob) => void;
  onToggleRecord?: (recording: boolean) => void;
}

/**
 * 현재는 UI 기반의 녹음 토글과 onRecord의 더미 Blob 호출만 제공.
 * 실제 녹음 기능을 원하시면 MediaRecorder 로직을 추가해야 합니다.
 */
const SpeakingListening: React.FC<Props> = ({
  prompt,
  options = [],
  onSelect,
  onRecord,
  onToggleRecord,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const timerRef = useRef<number | null>(null);

  const toggleRecording = () => {
    const next = !isRecording;
    setIsRecording(next);
    onToggleRecord?.(next);

    // 데모: 녹음 중지 시 더미 Blob 전달 (실제 녹음 아닌 더미 데이터)
    if (!next) {
      // simulate recorded audio blob
      const blob = new Blob(["dummy audio"], { type: "audio/wav" });
      onRecord?.(blob);
    } else {
      // 시작 시 타이머로 녹음(데모 목적)
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        // 자동 중지 데모(3초)
        setIsRecording(false);
        const blob = new Blob(["dummy audio"], { type: "audio/wav" });
        onRecord?.(blob);
        onToggleRecord?.(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-left">
        <h1 className="text-lg font-bold text-gray-800">말하기 / 듣기 연습</h1>
      </div>

      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-600 mb-2">설명</div>
        <div className="text-sm text-gray-800">{prompt}</div>
      </div>

      {options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect?.(opt)}
              className="p-3 rounded-lg text-left flex items-center gap-3 transition bg-white border border-gray-200 hover:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-700">
                ●
              </div>
              <div className="text-sm font-medium text-gray-800">{opt}</div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">녹음</div>
          <div className="text-sm text-gray-800">
            녹음 버튼을 눌러 말해보세요 (데모 자동 중지 3초)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-md font-medium ${
              isRecording ? "bg-red-500 text-white" : "bg-rose-50 text-rose-700"
            }`}
          >
            {isRecording ? "녹음 중지" : "녹음 시작"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeakingListening;
