import React, { useState } from "react";

interface VocabularyProps {
  onComplete: () => void;
}

interface Question {
  korean: string;
  options: string[];
  correct: string;
}

const vocabularyQuestions: Question[] = [
  {
    korean: "사과",
    options: ["Apple", "Banana", "Orange", "Grape"],
    correct: "Apple",
  },
  { korean: "고양이", options: ["Dog", "Cat", "Bird", "Fish"], correct: "Cat" },
  { korean: "책", options: ["Pen", "Paper", "Book", "Desk"], correct: "Book" },
];

const Vocabulary: React.FC<VocabularyProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const question = vocabularyQuestions[currentQuestion];

  const handleSelectAnswer = (answer: string): void => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = (): void => {
    if (!selectedAnswer) return;
    setIsCorrect(selectedAnswer === question.correct);
    setShowFeedback(true);
  };

  const handleContinue = (): void => {
    if (currentQuestion < vocabularyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="space-y-8 sm:space-y-12">
        {/* Question Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-2">
            이 단어의 영어 뜻은?
          </h1>
        </div>

        {/* Korean Word Card */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white rounded-3xl px-16 py-10 shadow-xl border border-gray-100">
              <span className="text-6xl sm:text-7xl font-bold bg-gradient-to-br from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {question.korean}
              </span>
            </div>
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(option)}
              disabled={showFeedback}
              className={`group relative p-5 rounded-2xl text-left transition-all duration-200 ${
                selectedAnswer === option
                  ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg scale-[1.02]"
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-rose-300 hover:shadow-md"
              } ${
                showFeedback
                  ? "cursor-not-allowed"
                  : "cursor-pointer active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    selectedAnswer === option
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-rose-100 group-hover:text-rose-600"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-lg font-semibold ${
                    selectedAnswer === option ? "text-white" : "text-gray-800"
                  }`}
                >
                  {option}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Check Button */}
        {!showFeedback && (
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedAnswer}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
              selectedAnswer
                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            정답 확인
          </button>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`rounded-2xl p-6 border-2 ${
              isCorrect
                ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                : "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  isCorrect
                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                    : "bg-gradient-to-br from-rose-500 to-pink-600"
                }`}
              >
                {isCorrect ? (
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isCorrect ? "text-green-700" : "text-rose-700"
                  }`}
                >
                  {isCorrect ? "정답입니다!" : "아쉬워요!"}
                </h3>
                {!isCorrect && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 font-medium">정답은</p>
                    <p className="text-lg font-bold text-gray-900">
                      {question.correct}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleContinue}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isCorrect
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              } text-white`}
            >
              다음 문제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Vocabulary;
