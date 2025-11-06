import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Vocabulary from "../components/Vocabulary";

type TrainingType =
  | "vocabulary"
  | "sentence"
  | "blank"
  | "writing"
  | "speakingListening";

const trainingSequence: TrainingType[] = [
  "vocabulary",
  "sentence",
  "blank",
  "writing",
  "speakingListening",
];

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

// Layout constants (px)
const FOOTER_BASE_HEIGHT = 64; // 기본 푸터 높이 (버튼 포함)
const SAFE_BOTTOM = 12; // 화면 하단과 푸터 사이 여백
const FEEDBACK_EXTRA_HEIGHT = 140; // 피드백이 확장될 때 추가로 올라오는 높이
const FOOTER_TOTAL_PADDING = FOOTER_BASE_HEIGHT + SAFE_BOTTOM; // 메인 padding-bottom

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();

  const initialType = useMemo(() => {
    if (!section) return "vocabulary";
    return trainingSequence.includes(section as TrainingType)
      ? (section as TrainingType)
      : "vocabulary";
  }, [section]);

  const [currentType, setCurrentType] = useState<TrainingType>(initialType);

  // vocabulary 상태 (Training이 체크/피드백/진행 관리)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const currentIndex = trainingSequence.indexOf(currentType);
  const overallProgress =
    currentIndex >= 0
      ? ((currentIndex + 1) / trainingSequence.length) * 100
      : (1 / trainingSequence.length) * 100;

  const handleTrainingComplete = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < trainingSequence.length) {
      const nextType = trainingSequence[nextIndex];
      setCurrentType(nextType);
      navigate(`/home/training/${nextType}`);
      resetVocabularyState();
    } else {
      alert("모든 훈련을 완료했습니다!");
      navigate("/home");
    }
  };

  const resetVocabularyState = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleClose = () => {
    navigate("/home");
  };

  // 현재 질문
  const question = vocabularyQuestions[currentQuestionIndex];

  // 선택 처리 (Vocabulary로부터 호출)
  const handleSelectAnswer = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  // 정답 확인: 피드백 노출, 푸터가 확장되며 내부 버튼은 "다음 문제" 동작으로 변환
  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer === question.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNextQuestionOrComplete = () => {
    if (currentQuestionIndex < vocabularyQuestions.length - 1) {
      setCurrentQuestionIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      handleTrainingComplete();
    }
  };

  // 푸터의 시각적 높이 (애니메이션 적용 대상)
  const footerHeight = showFeedback
    ? FOOTER_BASE_HEIGHT + FEEDBACK_EXTRA_HEIGHT + SAFE_BOTTOM
    : FOOTER_BASE_HEIGHT + SAFE_BOTTOM;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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
            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600 font-medium">
                {currentIndex >= 0 ? currentIndex + 1 : 1} /{" "}
                {trainingSequence.length}
              </div>
            </div>
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

      {/* Main: 상단 문제, 메인에 padding-bottom을 줘 푸터(확장 포함) 가려지지 않도록 함 */}
      <main
        className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4"
        style={{
          paddingBottom: `${FOOTER_TOTAL_PADDING + FEEDBACK_EXTRA_HEIGHT}px`,
        }}
      >
        <div className="w-full flex flex-col gap-4 h-full">
          {currentType === "vocabulary" ? (
            <>
              {/* 문제 영역을 상단에 배치 */}
              <div className="space-y-2">
                <div className="text-left">
                  <h1 className="text-lg font-bold text-gray-800">
                    이 단어의 영어 뜻은?
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    문제 {currentQuestionIndex + 1} /{" "}
                    {vocabularyQuestions.length}
                  </p>
                </div>

                <Vocabulary
                  question={question.korean}
                  options={question.options}
                  selected={selectedAnswer}
                  onSelect={handleSelectAnswer}
                />
              </div>

              <div className="flex-1" />
            </>
          ) : (
            <div className="py-6 text-center text-gray-500 text-sm">
              해당 훈련 컴포넌트가 아직 구현되지 않았습니다.
            </div>
          )}
        </div>
      </main>

      {/* Fixed footer: 버튼은 항상 푸터 내부에 위치. showFeedback 시 푸터가 위로 확장되며 피드백 내용이 버튼 위에 같이 보임.
          푸터 자체는 고정되어 있으므로 페이지 레이아웃이 밀리지 않음. */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="max-w-4xl w-full px-4"
          style={{
            // height animated via transition on inline style for smooth expansion
            height: `${footerHeight}px`,
            transition: "height 260ms ease",
            paddingBottom: `${SAFE_BOTTOM}px`,
            pointerEvents: "auto",
          }}
        >
          <div className="relative h-full flex flex-col justify-end">
            {/* 확장 영역: 피드백 내용이 이 영역 안에서 버튼 위로 '자라듯' 나타남 */}
            <div
              className="absolute left-4 right-4 top-0 flex justify-center"
              style={{
                // top 영역에서부터 아래로 공간을 차지하게 하여 '자라는' 효과 연출
                transform: showFeedback ? "translateY(0)" : `translateY(20px)`,
                opacity: showFeedback ? 1 : 0,
                transition: "transform 260ms ease, opacity 200ms ease",
                pointerEvents: showFeedback ? "auto" : "none",
              }}
            >
              {/* 피드백 카드 (푸터 안에서 확장되어 보임) */}
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
                            {question.correct}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 항상 보이는 버튼 영역 (푸터 바 내부). showFeedback true 시에도 버튼은 푸터 내부에 고정되어 있으며,
                label과 동작이 '다음 문제'로 바뀝니다. */}
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
                  ) : (
                    <button
                      onClick={handleNextQuestionOrComplete}
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
