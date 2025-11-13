// src/components/Vocabulary.tsx
import React from "react";
import { Check } from "lucide-react";

interface Props {
  question: string;
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}

const Vocabulary: React.FC<Props> = ({
  question,
  options,
  selected,
  onSelect,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 제목 및 설명 */}
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          이 단어의 영어 뜻은?
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          제시된 단어와 의미가 일치하는 보기를 선택하세요.
        </p>
      </div>

      {/* 문제 카드 (디자인 조화: bg-gray-50, border) */}
      <div className="w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6 min-h-[120px] flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-bold text-foreground text-center">
            {question}
          </span>
        </div>
      </div>

      {/* 선택지 그리드 (디자인 조화: bg-white, border, shadow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {options.map((option, index) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`group w-full rounded-2xl text-left p-4 sm:p-5 transition-all duration-300 ${
                isSelected
                  ? "bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/30 scale-[1.02]"
                  : "bg-white border border-gray-200 hover:border-rose-400 hover:shadow-lg hover:scale-[1.02] active:scale-[.98]"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* 번호 또는 아이콘 (디자인 조화) */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0 transition-colors ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-700 group-hover:bg-rose-100 group-hover:text-rose-600"
                  }`}
                >
                  {isSelected ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {/* 텍스트 */}
                <div
                  className={`text-base font-medium ${
                    isSelected ? "text-white" : "text-foreground"
                  }`}
                >
                  {option}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Vocabulary;
