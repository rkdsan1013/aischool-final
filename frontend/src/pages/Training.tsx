// src/pages/Training.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// --- 경로 수정 (빌드 오류 해결) ---
import Vocabulary from "../components/Vocabulary";
import Sentence from "../components/Sentence";
import Blank from "../components/Blank";
import Writing from "../components/Writing";
import Speaking from "../components/Speaking";
import type { QuestionItem, TrainingType } from "../services/trainingService";
import { fetchTrainingQuestions } from "../services/trainingService";
// --- 경로 수정 완료 ---

/* location.state 타입가드 */
function isLocState(
  obj: unknown
): obj is { startType?: TrainingType; questions?: QuestionItem[] } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  const hasStart = typeof o.startType === "string";
  const hasQuestions = Array.isArray(o.questions);
  return hasStart || hasQuestions;
}

// *** 원본 푸터 로직 복원 ***
const FOOTER_BASE_HEIGHT = 64; // 버튼 영역 높이
const SAFE_BOTTOM = 12; // 하단 여백
const FEEDBACK_AREA_HEIGHT = 140; // 피드백 내용이 표시될 영역 높이
const FOOTER_BUTTON_AREA_HEIGHT = FOOTER_BASE_HEIGHT + SAFE_BOTTOM; // 76px

// main 태그의 padding-bottom에 사용할 전체 높이 (스크롤 방지)
const MAIN_CONTENT_PADDING_BOTTOM =
  FOOTER_BASE_HEIGHT + SAFE_BOTTOM + FEEDBACK_AREA_HEIGHT; // 216px

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const locState = isLocState(location.state)
    ? (location.state as {
        startType?: TrainingType;
        questions?: QuestionItem[];
      })
    : undefined;

  // 안전한 rawStart 처리 (unknown)
  const rawStart: unknown =
    locState && (locState as Record<string, unknown>).startType;

  const startType =
    typeof rawStart === "string" && rawStart === "speakingListening"
      ? ("speaking" as TrainingType)
      : (rawStart as TrainingType | undefined);

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
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  useEffect(() => {
    if (!startType && !questions) {
      console.error("잘못된 접근입니다. 훈련은 홈에서 시작해주세요.");
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
          console.error("문제를 불러오지 못했습니다.");
          navigate("/home");
        } finally {
          setLoading(false);
        }
      };
      void load();
    }
  }, [startType, questions, navigate]);

  const currentQuestion = useMemo(
    () => (questions && questions[index] ? questions[index] : null),
    [questions, index]
  );

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

  // 닫기 버튼은 피드백 여부와 상관없이 항상 동작
  const handleClose = () => {
    navigate("/home");
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setSelectedOrder([]);
    setWritingValue("");
    setRecordedBlob(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
  };

  const handlePickPart = (part: string) => {
    if (showFeedback) return;
    setSelectedOrder((s) => (s.includes(part) ? s : [...s, part]));
  };

  const handleRemovePart = (part: string) => {
    if (showFeedback) return;
    setSelectedOrder((s) => s.filter((x) => x !== part));
  };

  const handleReorder = (next: string[]) => {
    if (showFeedback) return;
    setSelectedOrder(next);
  };

  const handleResetOrder = () => {
    if (showFeedback) return;
    setSelectedOrder([]);
  };

  const handleWritingChange = (v: string) => {
    if (showFeedback) return;
    setWritingValue(v);
  };

  const handleRecordToggle = () => {
    if (showFeedback) return;
  };

  const handleRecordReceived = (blob: Blob) => {
    if (showFeedback) return;
    setRecordedBlob(blob);
    console.debug("received recording blob (demo)", blob);
  };

  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length &&
    a.every((v, i) => v.trim() === (b[i] ?? "").trim());

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    let correct = false;

    switch (currentQuestion.type) {
      case "vocabulary":
      case "blank": {
        const correctField = currentQuestion.correct;
        correct =
          typeof correctField === "string"
            ? correctField === selectedAnswer
            : Array.isArray(correctField)
            ? !!selectedAnswer && correctField.includes(selectedAnswer)
            : false;
        break;
      }
      case "speaking": {
        correct = Boolean(recordedBlob);
        break;
      }
      case "sentence": {
        if (Array.isArray(currentQuestion.correct)) {
          correct = arraysEqual(currentQuestion.correct, selectedOrder);
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
    console.log("학습을 종료합니다.");
    navigate("/home");
  };

  const footerVisualHeight = showFeedback
    ? FOOTER_BUTTON_AREA_HEIGHT + FEEDBACK_AREA_HEIGHT
    : FOOTER_BUTTON_AREA_HEIGHT;

  const canCheck = useMemo(() => {
    if (!currentQuestion) return false;
    switch (currentQuestion.type) {
      case "sentence":
        return selectedOrder.length > 0;
      case "writing":
        return writingValue.trim().length > 0;
      case "speaking":
        return Boolean(recordedBlob);
      default:
        return selectedAnswer != null;
    }
  }, [
    currentQuestion,
    selectedOrder,
    writingValue,
    recordedBlob,
    selectedAnswer,
  ]);

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
        <div className="text-gray-500">
          문제를 불러오는 중이거나, 문제가 없습니다.
        </div>
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
        // Writing 컴포넌트가 "sentence" (한국어 원문) prop을 기대하므로 prop 이름을 맞춤
        return (
          <Writing
            sentence={String(item.question ?? "")}
            initialValue={writingValue}
            onChange={handleWritingChange}
            disabled={showFeedback}
          />
        );
      case "speaking":
        return (
          <Speaking
            prompt={item.question}
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
      {/* --- Header --- */}
      <header className="flex-none border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          {/* 닫기 버튼을 overlay보다 위에 놓고 항상 클릭 가능하게 z-index와 pointer-events 설정 */}
          <button
            onClick={handleClose}
            className="w-8 h-8 relative z-40 flex items-center justify-center text-gray-600 rounded-md hover:bg-gray-100 transition"
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

          {/* Progress Bar */}
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

      {/* --- Main Content --- */}
      <main
        className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4 overflow-y-auto relative"
        style={{ paddingBottom: `${MAIN_CONTENT_PADDING_BOTTOM}px` }}
      >
        {/* Interaction blocker: 피드백이 올라오면 메인 영역 인터랙션 차단 (header 버튼은 영향을 받지 않음) */}
        {showFeedback && (
          <div
            className="absolute inset-0 bg-transparent"
            style={{ zIndex: 30, pointerEvents: "auto" }}
            aria-hidden="true"
          />
        )}

        <fieldset
          disabled={showFeedback}
          className="w-full flex flex-col gap-4 h-full"
        >
          {renderQuestionComponent(currentQuestion)}
          <div className="flex-1" />
        </fieldset>
      </main>

      {/* --- Footer (원본 슬라이딩 로직 복원) --- */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex justify-center"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="max-w-4xl w-full relative overflow-hidden"
          style={{
            height: `${footerVisualHeight}px`,
            transition: "height 260ms ease",
            pointerEvents: "auto",
          }}
        >
          {/* 피드백 카드 */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ease-out ${
              showFeedback ? "translate-y-0" : "translate-y-full"
            } ${
              isCorrect
                ? "bg-green-100 border-t border-green-200"
                : "bg-rose-100 border-t border-rose-200"
            } rounded-t-2xl shadow-2xl`}
            style={{
              height: "100%",
              zIndex: 5,
              pointerEvents: showFeedback ? "auto" : "none",
            }}
          >
            <div
              className="max-w-4xl mx-auto w-full flex items-start gap-3 p-4"
              style={{ height: `${FEEDBACK_AREA_HEIGHT}px` }}
            >
              {showFeedback && (
                <>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? "bg-green-500" : "bg-rose-500"
                    }`}
                  >
                    {isCorrect ? (
                      <svg
                        className="w-6 h-6 text-white"
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
                        className="w-6 h-6 text-white"
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
                      className={`text-lg font-semibold ${
                        isCorrect ? "text-green-800" : "text-rose-800"
                      }`}
                    >
                      {isCorrect ? "정답입니다!" : "아쉬워요!"}
                    </div>
                    {!isCorrect &&
                      currentQuestion.type !== "writing" &&
                      currentQuestion.type !== "speaking" && (
                        <div className="mt-1">
                          <div className="text-sm text-gray-600">정답은</div>
                          <div className="text-base font-bold text-gray-900 mt-1">
                            {String(currentQuestion.correct ?? "")}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 버튼 컨테이너 */}
          <div
            className="absolute bottom-0 left-0 right-0 w-full"
            style={{
              height: `${FOOTER_BUTTON_AREA_HEIGHT}px`,
              paddingBottom: `${SAFE_BOTTOM}px`,
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <div
              className="flex items-center max-w-4xl mx-auto w-full px-4"
              style={{
                height: `${FOOTER_BASE_HEIGHT}px`,
              }}
            >
              <div className="w-full px-0">
                {!showFeedback ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!canCheck}
                    className={`w-full h-12 rounded-xl font-semibold text-base transition duration-200 ${
                      canCheck
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 active:scale-[.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    style={{ pointerEvents: "auto" }}
                  >
                    정답 확인
                  </button>
                ) : isLastQuestion ? (
                  <button
                    onClick={handleTrainingComplete}
                    className="w-full h-12 rounded-xl font-semibold text-base transition duration-200 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-[.98]"
                    style={{ pointerEvents: "auto" }}
                  >
                    학습 종료
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={`w-full h-12 rounded-xl font-semibold text-base transition duration-200 text-white shadow-lg active:scale-[.98] ${
                      isCorrect
                        ? "bg-green-600 shadow-green-500/20"
                        : "bg-rose-600 shadow-rose-500/20"
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
  );
};

export default TrainingPage;
