// src/pages/Training.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Vocabulary from "../components/Vocabulary";

type TrainingType =
  | "vocabulary"
  | "sentence"
  | "blank"
  | "writing"
  | "speakingListening";

interface Media {
  audio?: string;
  image?: string;
}

interface QuestionItem {
  id: string;
  type: TrainingType;
  question: string;
  options?: string[];
  correct?: string | string[];
  media?: Media;
  meta?: Record<string, unknown>;
}

/* 예시 문제 목록 */
const questionList: QuestionItem[] = [
  {
    id: "q1",
    type: "vocabulary",
    question: "사과",
    options: ["Apple", "Banana", "Orange", "Grape"],
    correct: "Apple",
  },
  {
    id: "q2",
    type: "vocabulary",
    question: "고양이",
    options: ["Dog", "Cat", "Bird", "Fish"],
    correct: "Cat",
  },
  {
    id: "q3",
    type: "vocabulary",
    question: "책",
    options: ["Pen", "Paper", "Book", "Desk"],
    correct: "Book",
  },
];

/* Layout 상수 (푸터/피드백 높이 및 안전 여백) */
const FOOTER_BASE_HEIGHT = 64; // 버튼 포함 기본 푸터 높이(px)
const SAFE_BOTTOM = 12; // 바텀 안전 여백(px)
const FEEDBACK_EXTRA_HEIGHT = 140; // 피드백 확장시 추가 높이(px)
const FOOTER_TOTAL_PADDING =
  FOOTER_BASE_HEIGHT + SAFE_BOTTOM + FEEDBACK_EXTRA_HEIGHT;

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();

  const [index, setIndex] = useState<number>(0);
  const currentQuestion = questionList[index];

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const totalSteps = questionList.length;
  // progress: 정답 확인을 눌러 피드백이 보일 때에만 해당 문제를 '완료'로 간주
  const overallProgress =
    ((showFeedback ? index + 1 : index) / Math.max(totalSteps, 1)) * 100;
  const isLastQuestion = index === questionList.length - 1;

  const handleClose = () => navigate("/home");

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    // correct 필드가 문자열 또는 문자열 배열일 수 있으므로 검사 처리
    const correctField = currentQuestion.correct;
    const correct =
      typeof correctField === "string"
        ? correctField === selectedAnswer
        : Array.isArray(correctField)
        ? correctField.includes(selectedAnswer)
        : false;

    setIsCorrect(Boolean(correct));
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (index < questionList.length - 1) {
      setIndex((i) => i + 1);
      resetQuestionState();
    } else {
      handleTrainingComplete();
    }
  };

  const handleTrainingComplete = () => {
    alert("학습을 종료합니다.");
    navigate("/home");
  };

  const renderQuestionComponent = (item: QuestionItem) => {
    switch (item.type) {
      case "vocabulary":
        return (
          <Vocabulary
            question={item.question}
            options={item.options ?? []}
            selected={selectedAnswer}
            onSelect={handleSelect}
          />
        );
      case "sentence":
        return (
          <div className="py-6 text-center text-gray-500">
            Sentence component not implemented yet
          </div>
        );
      case "blank":
        return (
          <div className="py-6 text-center text-gray-500">
            Blank component not implemented yet
          </div>
        );
      case "writing":
        return (
          <div className="py-6 text-center text-gray-500">
            Writing component not implemented yet
          </div>
        );
      case "speakingListening":
        return (
          <div className="py-6 text-center text-gray-500">
            Speaking & Listening not implemented yet
          </div>
        );
      default:
        return (
          <div className="py-6 text-center text-gray-500">Unknown type</div>
        );
    }
  };

  const footerVisualHeight = showFeedback
    ? FOOTER_BASE_HEIGHT + SAFE_BOTTOM + FEEDBACK_EXTRA_HEIGHT
    : FOOTER_BASE_HEIGHT + SAFE_BOTTOM;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header: progress bar only */}
      <header className="flex-none border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-600 rounded-md hover:bg-gray-100"
            aria-label="닫기"
            type="button"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex-1 px-3">
            <div className="mt-2">
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="w-8" />
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4"
        style={{ paddingBottom: `${FOOTER_TOTAL_PADDING}px` }}
      >
        <div className="w-full flex flex-col gap-4 h-full">
          {/* 문제 컴포넌트가 자체적으로 제목/메타를 렌더링 */}
          {renderQuestionComponent(currentQuestion)}
          <div className="flex-1" />
        </div>
      </main>

      {/* Fixed footer */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="max-w-4xl w-full px-4"
          style={{
            height: `${footerVisualHeight}px`,
            transition: "height 260ms ease",
            paddingBottom: `${SAFE_BOTTOM}px`,
            pointerEvents: "auto",
          }}
        >
          <div className="relative h-full flex flex-col justify-end">
            {/* 확장 영역: 피드백 내용 */}
            <div
              className="absolute left-4 right-4 top-0 flex justify-center"
              style={{
                transform: showFeedback ? "translateY(0)" : "translateY(20px)",
                opacity: showFeedback ? 1 : 0,
                transition: "transform 260ms ease, opacity 200ms ease",
                pointerEvents: showFeedback ? "auto" : "none",
              }}
            >
              {showFeedback && (
                <div
                  className={`w-full rounded-lg p-3 border shadow-md ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-rose-50 border-rose-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center ${
                        isCorrect ? "bg-green-500" : "bg-rose-500"
                      }`}
                    >
                      {isCorrect ? (
                        <svg
                          className="w-5 h-5 text-white"
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
                          className="w-5 h-5 text-white"
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
                      <div
                        className={`text-sm font-semibold ${
                          isCorrect ? "text-green-700" : "text-rose-700"
                        }`}
                      >
                        {isCorrect ? "정답입니다!" : "아쉬워요!"}
                      </div>
                      {!isCorrect && (
                        <div className="mt-1">
                          <div className="text-xs text-gray-500">정답은</div>
                          <div className="text-sm font-bold text-gray-900 mt-1">
                            {currentQuestion.correct}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 항상 보이는 버튼 */}
            <div className="w-full">
              <div
                style={{
                  height: `${FOOTER_BASE_HEIGHT}px`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div className="w-full px-0">
                  {!showFeedback ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!selectedAnswer}
                      className={`w-full h-12 rounded-lg font-semibold text-base transition ${
                        selectedAnswer
                          ? "bg-rose-500 text-white shadow"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      style={{ pointerEvents: "auto" }}
                    >
                      정답 확인
                    </button>
                  ) : isLastQuestion ? (
                    <button
                      onClick={handleTrainingComplete}
                      className="w-full h-12 rounded-lg font-semibold text-base transition bg-indigo-600 text-white shadow"
                      style={{ pointerEvents: "auto" }}
                    >
                      학습 종료
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className={`w-full h-12 rounded-lg font-semibold text-base transition ${
                        isCorrect
                          ? "bg-green-600 text-white shadow"
                          : "bg-rose-600 text-white shadow"
                      }`}
                      style={{ pointerEvents: "auto" }}
                    >
                      다음 문제
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
