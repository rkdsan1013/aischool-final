// src/components/Blank.tsx
import React from "react";

interface Props {
  question: string;
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}

const Blank: React.FC<Props> = ({ question, options, selected, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="text-left">
        <h1 className="text-lg font-bold text-gray-800">
          빈칸에 들어갈 올바른 단어를 고르세요
        </h1>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <span className="text-lg font-medium text-gray-800">{question}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${
                isSelected
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {opt[0]?.toUpperCase() ?? "•"}
              </div>
              <div
                className={`text-sm font-medium ${
                  isSelected ? "text-white" : "text-gray-800"
                }`}
              >
                {opt}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Blank;
