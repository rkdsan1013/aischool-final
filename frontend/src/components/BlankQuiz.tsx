import React from "react";

interface BlankQuizProps {
  questionIndex: number;
  question: {
    sentence: string;
    options: string[];
    correctAnswer?: number; // Training이 관리하므로 optional
  };
  selectedIndex: number | null;
  disabled?: boolean;
  onSelect: (index: number) => void;
}

const BlankQuiz: React.FC<BlankQuizProps> = ({
  questionIndex,
  question,
  selectedIndex,
  disabled = false,
  onSelect,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
        빈칸에 알맞은 단어를 선택하세요
      </h2>

      <div className="mb-8 sm:mb-12">
        <div className="text-center text-xl sm:text-2xl lg:text-3xl font-medium text-gray-800 p-6 sm:p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
          {question.sentence.split("____").map((part, idx, arr) => (
            <span key={idx}>
              {part}
              {idx < arr.length - 1 && (
                <span className="inline-block min-w-[120px] border-b-4 border-rose-500 mx-2 pb-1">
                  {/* Training에서 피드백을 내려줄 것이므로 여기서는 보여주지 않음 */}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={disabled}
              className={`w-full p-4 sm:p-5 rounded-xl border-2 text-left text-base sm:text-lg font-medium transition-all duration-200 ${
                isSelected
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-gray-200 hover:border-rose-200 hover:bg-gray-50 text-gray-700"
              } ${
                disabled
                  ? "cursor-not-allowed"
                  : "cursor-pointer active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {idx + 1}
                </span>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BlankQuiz;
