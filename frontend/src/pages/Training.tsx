// src/pages/Training.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Vocabulary from "../components/Vocabulary";
import Sentence from "../components/Sentence";
import Blank from "../components/Blank";
import Writing from "../components/Writing";
import SpeakingListening from "../components/SpeakingListening";
import type { QuestionItem, TrainingType } from "../services/trainingService";
import { fetchTrainingQuestions } from "../services/trainingService";

/* location.state 타입가드 */
function isLocState(
  obj: unknown
): obj is { startType?: TrainingType; questions?: QuestionItem[] } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  if ("startType" in o && typeof o.startType !== "undefined")
    return typeof o.startType === "string";
  if ("questions" in o && typeof o.questions !== "undefined")
    return Array.isArray(o.questions);
  return false;
}

const FOOTER_BASE_HEIGHT = 64;
const SAFE_BOTTOM = 12;
const FEEDBACK_EXTRA_HEIGHT = 140;
const FOOTER_TOTAL_PADDING =
  FOOTER_BASE_HEIGHT + SAFE_BOTTOM + FEEDBACK_EXTRA_HEIGHT;

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const locState = isLocState(location.state)
    ? (location.state as {
        startType?: TrainingType;
        questions?: QuestionItem[];
      })
    : undefined;
  const startType = locState?.startType as TrainingType | undefined;

  const [questions, setQuestions] = useState<QuestionItem[] | null>(
    locState?.questions ?? null
  );
  const [loading, setLoading] = useState<boolean>(
    !locState?.questions && Boolean(startType)
  );
  const [index, setIndex] = useState<number>(0);

  // UI 상태
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [writingValue, setWritingValue] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    if (!startType) {
      window.alert("잘못된 접근입니다. 훈련은 홈에서 시작해주세요.");
      navigate("/home");
      return;
    }

    if (!questions && startType) {
      const load = async () => {
        try {
          setLoading(true);
          const data = await fetchTrainingQuestions(startType);
          setQuestions(data);
          setIndex(0);
        } catch (err) {
          console.error(err);
          window.alert("문제를 불러오지 못했습니다.");
          navigate("/home");
        } finally {
          setLoading(false);
        }
      };
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = useMemo(
    () => (questions && questions[index] ? questions[index] : null),
    [questions, index]
  );

  // stable options: 참조 안정화를 위해 복사 전달
  const stableOptions = useMemo(
    () => (currentQuestion?.options ? [...currentQuestion.options] : []),
    [currentQuestion?.options]
  );

  const totalSteps = questions?.length ?? 0;
  const overallProgress =
    totalSteps === 0
      ? 0
      : ((showFeedback ? index + 1 : index) / Math.max(totalSteps, 1)) * 100;
  const isLastQuestion = index === (questions?.length ?? 1) - 1;

  const handleClose = () => navigate("/home");

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setSelectedOrder([]);
    setWritingValue("");
    setIsRecording(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
  };

  // onPick: 풀에서 단어 하나를 추가했을 때
  const handlePickPart = (part: string) => {
    if (showFeedback) return;
    setSelectedOrder((s) => (s.includes(part) ? s : [...s, part]));
  };

  // onRemove: 선택된 항목을 제거했을 때
  const handleRemovePart = (part: string) => {
    if (showFeedback) return;
    setSelectedOrder((s) => s.filter((x) => x !== part));
  };

  // onReorder: 전체 재배열 결과를 받았을 때 (Sentence에서 호출)
  const handleReorder = (next: string[]) => {
    if (showFeedback) return;
    setSelectedOrder(next);
  };

  const handleResetOrder = () => {
    if (showFeedback) return;
    setSelectedOrder([]);
  };

  const handleWritingChange = (v: string) => {
    setWritingValue(v);
  };

  const handleRecordToggle = (recording: boolean) => {
    setIsRecording(recording);
  };

  const handleRecordReceived = (blob: Blob) => {
    setIsRecording(false);
    console.debug("received recording blob (demo)", blob);
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    let correct = false;

    switch (currentQuestion.type) {
      case "vocabulary":
      case "blank":
      case "speakingListening": {
        const correctField = currentQuestion.correct;
        correct =
          typeof correctField === "string"
            ? correctField === selectedAnswer
            : Array.isArray(correctField)
            ? !!selectedAnswer && correctField.includes(selectedAnswer)
            : false;
        break;
      }
      case "sentence": {
        if (Array.isArray(currentQuestion.correct)) {
          correct =
            JSON.stringify(currentQuestion.correct) ===
            JSON.stringify(selectedOrder);
        } else if (typeof currentQuestion.correct === "string") {
          correct = currentQuestion.correct === selectedOrder.join(" ");
        } else {
          correct = false;
        }
        break;
      }
      case "writing": {
        correct = writingValue.trim().length > 0;
        break;
      }
      default:
        correct = false;
    }

    setIsCorrect(Boolean(correct));
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!questions) return;
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      resetQuestionState();
    } else {
      handleTrainingComplete();
    }
  };

  const handleTrainingComplete = () => {
    window.alert("학습을 종료합니다.");
    navigate("/home");
  };

  const footerVisualHeight = showFeedback
    ? FOOTER_BASE_HEIGHT + SAFE_BOTTOM + FEEDBACK_EXTRA_HEIGHT
    : FOOTER_BASE_HEIGHT + SAFE_BOTTOM;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-gray-500">문제가 없습니다.</div>
      </div>
    );
  }

  const renderQuestionComponent = (item: QuestionItem) => {
    switch (item.type) {
      case "vocabulary":
        return (
          <Vocabulary
            question={item.question}
            options={stableOptions}
            selected={selectedAnswer}
            onSelect={handleSelect}
          />
        );
      case "sentence":
        return (
          <Sentence
            question={item.question}
            options={stableOptions}
            selectedOrder={selectedOrder}
            onPick={handlePickPart}
            onRemove={handleRemovePart}
            onReorder={handleReorder}
            onReset={handleResetOrder}
          />
        );
      case "blank":
        return (
          <Blank
            question={item.question}
            options={stableOptions}
            selected={selectedAnswer}
            onSelect={handleSelect}
          />
        );
      case "writing":
        return (
          <Writing
            prompt={item.question}
            initialValue={writingValue}
            onChange={handleWritingChange}
          />
        );
      case "speakingListening":
        return (
          <SpeakingListening
            prompt={item.question}
            options={stableOptions}
            onSelect={handleSelect}
            onRecord={handleRecordReceived}
            onToggleRecord={handleRecordToggle}
          />
        );
      default:
        return (
          <div className="py-6 text-center text-gray-500">
            지원하지 않는 문제 유형입니다.
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
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

      <main
        className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4"
        style={{ paddingBottom: `${FOOTER_TOTAL_PADDING}px` }}
      >
        <div className="w-full flex flex-col gap-4 h-full">
          {renderQuestionComponent(currentQuestion)}
          <div className="flex-1" />
        </div>
      </main>

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
                            {String(currentQuestion.correct ?? "")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                      disabled={
                        currentQuestion?.type === "sentence"
                          ? selectedOrder.length === 0
                          : currentQuestion?.type === "writing"
                          ? writingValue.trim().length === 0
                          : currentQuestion?.type === "speakingListening"
                          ? isRecording
                          : selectedAnswer == null
                      }
                      className={`w-full h-12 rounded-lg font-semibold text-base transition ${
                        (
                          currentQuestion?.type === "writing"
                            ? writingValue.trim().length > 0
                            : currentQuestion?.type === "sentence"
                            ? selectedOrder.length > 0
                            : selectedAnswer
                        )
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
