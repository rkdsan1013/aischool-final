// src/components/Writing.tsx
import React, { useEffect, useState } from "react";

interface Props {
  // Training에서 전달하는 원문(한국어) prop 이름을 `sentence`로 수용
  sentence: string;
  // Controlled 모드용 value (부모가 상태를 완전히 제어할 때 사용)
  value?: string;
  // Uncontrolled 초기값(하위 호환용)
  initialValue?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  // 부모(예: Training)에서 피드백 중일 때 입력을 비활성화하기 위해 추가
  disabled?: boolean;
}

const Writing: React.FC<Props> = ({
  sentence,
  value,
  initialValue = "",
  maxLength = 300,
  onChange,
  disabled = false,
}) => {
  // 내부 상태는 controlled(value가 주어지지 않은 경우에만 사용)
  const [internalValue, setInternalValue] = useState<string>(
    value !== undefined ? value : initialValue
  );

  // 부모가 controlled value를 제공하면 내부 상태를 동기화
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // initialValue가 바뀔 때 (uncontrolled 사용 시) 내부 상태 동기화
  useEffect(() => {
    if (value === undefined) {
      setInternalValue(initialValue);
    }
  }, [initialValue, value]);

  const handleChange = (v: string) => {
    if (disabled) return;
    const newValue = v.slice(0, maxLength);
    // controlled 모드가 아닐 때만 내부 상태를 업데이트
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const remaining = maxLength - internalValue.length;

  return (
    <div className="w-full h-full min-h-0 flex flex-col space-y-4 sm:space-y-5">
      {/* 제목 및 설명 */}
      <div className="text-left px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          작문 연습
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          아래 한국어 문장을 보고 자연스럽게 영어로 번역하여 작성하세요.
        </p>
      </div>

      {/* 원문 카드 */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          원문 (한국어)
        </div>
        <div className="text-lg sm:text-xl font-medium text-foreground whitespace-pre-wrap">
          {sentence}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="relative flex-1 min-h-0">
        <textarea
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="여기에 영어로 번역하여 작성하세요..."
          className={`w-full h-full min-h-[200px] sm:min-h-[240px] p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-500 transition-colors placeholder:text-muted-foreground text-base text-foreground ${
            disabled ? "opacity-60 pointer-events-none" : ""
          }`}
          aria-label="작문 입력"
        />
        <div
          className={`absolute bottom-4 right-5 text-sm font-medium ${
            remaining < 20 ? "text-red-500" : "text-muted-foreground"
          }`}
        >
          {internalValue.length}/{maxLength}
        </div>
      </div>
    </div>
  );
};

export default Writing;
