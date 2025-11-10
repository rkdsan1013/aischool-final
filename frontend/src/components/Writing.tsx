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
    if (v.length > maxLength) return;
    setValue(v);
    onChange?.(v);
  };

  return (
    <div className="space-y-3">
      <div className="text-left">
        <h1 className="text-lg font-bold text-gray-800">작문 문제</h1>
      </div>

      <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-600 mb-2">문제</div>
        <div className="text-sm text-gray-800">{prompt}</div>
      </div>

      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="여기에 영어로 작성하세요..."
        className="w-full min-h-[160px] p-3 rounded-lg border border-gray-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-200"
      />

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div>자유롭게 작성하세요. 가능하면 한 문단(2~4문장)</div>
        <div>
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  );
};

export default Writing;
