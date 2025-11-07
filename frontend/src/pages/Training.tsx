import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Vocabulary from "../components/Vocabulary";
import BlankQuiz from "../components/BlankQuiz";
// import SentenceArrange from "../components/SentenceArrange";
// import SpeakingListening from "../components/SpeakingListening";
// import Writing from "../components/Writing";

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

// 예시 데이터 (각 세션은 자체 데이터/props로 바꿀 수 있음)
const blankQuestions = [
  {
    sentence: "I love eating ____",
    options: ["pizza", "shoes", "hair", "book"],
    correctAnswer: 0,
  },
  {
    sentence: "She is ____ a book",
    options: ["eating", "reading", "drinking", "running"],
    correctAnswer: 1,
  },
  {
    sentence: "The cat is ____ on the sofa",
    options: ["flying", "swimming", "sleeping", "cooking"],
    correctAnswer: 2,
  },
];

const vocabularyQuestions = [
  {
    korean: "사과",
    options: ["Apple", "Banana", "Orange", "Grape"],
    correct: "Apple",
  },
  { korean: "고양이", options: ["Dog", "Cat", "Bird", "Fish"], correct: "Cat" },
  { korean: "책", options: ["Pen", "Paper", "Book", "Desk"], correct: "Book" },
];

const FOOTER_BASE_HEIGHT = 64;
const SAFE_BOTTOM = 12;
const FEEDBACK_EXTRA_HEIGHT = 140;
const FOOTER_TOTAL_PADDING = FOOTER_BASE_HEIGHT + SAFE_BOTTOM;

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

  // --- Vocabulary shared state (example) ---
  const [vocabIndex, setVocabIndex] = useState(0);
  const [vocabSelected, setVocabSelected] = useState<string | null>(null);

  // --- BlankQuiz controlled state (Training이 관리) ---
  const [blankIndex, setBlankIndex] = useState(0);
  const [blankSelected, setBlankSelected] = useState<number | null>(null);

  // 공통 피드백 플래그 (현재 예시는 vocabulary와 blank만 footer 피드백 사용)
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentIndex = trainingSequence.indexOf(currentType);
  const overallProgress = ((currentIndex + 1) / trainingSequence.length) * 100;

  const handleTrainingComplete = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < trainingSequence.length) {
      const nextType = trainingSequence[nextIndex];
      setCurrentType(nextType);
      navigate(`/home/training/${nextType}`);
      resetAllSessionState();
    } else {
      alert("모든 훈련을 완료했습니다!");
      navigate("/home");
    }
  };

  const resetAllSessionState = () => {
    setVocabIndex(0);
    setVocabSelected(null);
    setBlankIndex(0);
    setBlankSelected(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleClose = () => navigate("/home");

  // --- Handlers for BlankQuiz selection + footer actions ---
  const handleBlankSelect = (index: number) => {
    if (showFeedback) return;
    setBlankSelected(index);
  };

  const handleCheckAnswer = () => {
    // route-specific check: decide which session is being checked
    if (currentType === "vocabulary") {
      if (!vocabSelected) return;
      const correct = vocabSelected === vocabularyQuestions[vocabIndex].correct;
      setIsCorrect(!!correct);
      setShowFeedback(true);
    } else if (currentType === "blank") {
      if (blankSelected === null) return;
      const correct =
        blankSelected === blankQuestions[blankIndex].correctAnswer;
      setIsCorrect(correct);
      setShowFeedback(true);
    } else {
      // 다른 세션의 경우 footer 버튼이 필요 없다면 무시하거나 onComplete 호출
    }
  };

  const handleNextQuestionOrComplete = () => {
    if (currentType === "vocabulary") {
      if (vocabIndex < vocabularyQuestions.length - 1) {
        setVocabIndex((i) => i + 1);
        setVocabSelected(null);
        setShowFeedback(false);
        setIsCorrect(false);
      } else {
        handleTrainingComplete();
      }
    } else if (currentType === "blank") {
      if (blankIndex < blankQuestions.length - 1) {
        setBlankIndex((i) => i + 1);
        setBlankSelected(null);
        setShowFeedback(false);
        setIsCorrect(false);
      } else {
        handleTrainingComplete();
      }
    }
  };

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
                {currentIndex + 1} / {trainingSequence.length}
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

      {/* Main: session components only */}
      <main
        className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4"
        style={{
          paddingBottom: `${FOOTER_TOTAL_PADDING + FEEDBACK_EXTRA_HEIGHT}px`,
        }}
      >
        <div className="w-full flex flex-col gap-4 h-full">
          {currentType === "vocabulary" && (
            <Vocabulary
              question={vocabularyQuestions[vocabIndex].korean}
              options={vocabularyQuestions[vocabIndex].options}
              selected={vocabSelected}
              onSelect={(ans) => setVocabSelected(ans)}
            />
          )}

          {currentType === "blank" && (
            <BlankQuiz
              questionIndex={blankIndex}
              question={blankQuestions[blankIndex]}
              selectedIndex={blankSelected}
              disabled={showFeedback}
              onSelect={handleBlankSelect}
            />
          )}

          {/* {currentType === "sentence" && (
            <SentenceArrange onComplete={handleTrainingComplete} />
          )}
          {currentType === "writing" && (
            <Writing onComplete={handleTrainingComplete} />
          )}
          {currentType === "speakingListening" && (
            <SpeakingListening onComplete={handleTrainingComplete} />
          )} */}
        </div>
      </main>

      {/* Footer */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="max-w-4xl w-full px-4"
          style={{
            height: `${footerHeight}px`,
            transition: "height 260ms ease",
            paddingBottom: `${SAFE_BOTTOM}px`,
            pointerEvents: "auto",
          }}
        >
          <div className="relative h-full flex flex-col justify-end">
            <div
              className="absolute left-4 right-4 top-0 flex justify-center"
              style={{
                transform: showFeedback ? "translateY(0)" : `translateY(20px)`,
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
                            {currentType === "vocabulary"
                              ? vocabularyQuestions[vocabIndex].correct
                              : blankQuestions[blankIndex].options[
                                  blankQuestions[blankIndex].correctAnswer
                                ]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="w-full">
              <div
                style={{
                  height: `${FOOTER_BASE_HEIGHT}px`,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div className="w-full px-0">
                  {/* Show check/next only for sessions that use this footer flow (vocabulary, blank) */}
                  {(currentType === "vocabulary" ||
                    currentType === "blank") && (
                    <>
                      {!showFeedback ? (
                        <button
                          onClick={handleCheckAnswer}
                          disabled={
                            currentType === "vocabulary"
                              ? !vocabSelected
                              : blankSelected === null
                          }
                          className={`w-full h-12 rounded-lg font-semibold text-base transition ${
                            (
                              currentType === "vocabulary"
                                ? vocabSelected
                                : blankSelected !== null
                            )
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
                    </>
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
