// src/components/Writing.tsx
import React, { useEffect, useState } from "react";

interface Props {
  prompt: string;
  initialValue?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}

const Writing: React.FC<Props> = ({
  prompt,
  initialValue = "",
  maxLength = 300,
  onChange,
}) => {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (v: string) => {
    // maxLength를 초과하는 입력 방지
    const newValue = v.slice(0, maxLength);
    setValue(newValue);
    onChange?.(newValue);
  };

  const remaining = maxLength - value.length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 제목 및 설명 */}
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          작문 연습
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          제시된 주제에 대해 영어로 자유롭게 작성해보세요.
        </p>
      </div>

      {/* 프롬프트 카드 */}
      <div className="bg-card border-2 border-gray-200 rounded-2xl p-5 sm:p-6">
        <div className="text-sm font-semibold text-muted-foreground mb-2">
          주제
        </div>
        <div className="text-lg sm:text-xl font-medium text-foreground">
          {prompt}
        </div>
      </div>

      {/* 텍스트 입력 영역 */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="여기에 영어로 작성하세요..."
          className="w-full min-h-[200px] sm:min-h-[240px] p-4 sm:p-5 rounded-2xl border-2 border-gray-200 bg-card resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors placeholder:text-muted-foreground text-base text-foreground"
          aria-label="작문 입력"
        />
        {/* 글자 수 제한 */}
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
