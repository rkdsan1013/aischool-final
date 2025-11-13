// src/components/Writing.tsx
import React, { useEffect, useState } from "react";

interface Props {
  // Training에서 전달하는 원문(한국어) prop 이름을 `sentence`로 수용
  sentence: string;
  initialValue?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  // 부모(예: Training)에서 피드백 중일 때 입력을 비활성화하기 위해 추가
  disabled?: boolean;
}

const Writing: React.FC<Props> = ({
  sentence,
  initialValue = "",
  maxLength = 300,
  onChange,
  disabled = false,
}) => {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (v: string) => {
    if (disabled) return;
    const newValue = v.slice(0, maxLength);
    setValue(newValue);
    onChange?.(newValue);
  };

  const remaining = maxLength - value.length;

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
          value={value}
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
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  );
};

export default Writing;
