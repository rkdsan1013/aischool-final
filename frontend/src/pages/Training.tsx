// frontend/src/pages/Training.tsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Loader2 } from "lucide-react";

import Vocabulary from "../components/Vocabulary";
import Sentence from "../components/Sentence";
import Blank from "../components/Blank";
import Writing from "../components/Writing";
import Speaking from "../components/Speaking";
import type { QuestionItem, TrainingType } from "../services/trainingService";
import {
  fetchTrainingQuestions,
  verifyAnswer,
} from "../services/trainingService";
import { useProfile } from "../hooks/useProfile";

type ExtendedQuestionItem = QuestionItem & {
  canonical_preferred?: string;
  preferred?: string;
};

function isLocState(
  obj: unknown
): obj is { startType?: TrainingType; questions?: QuestionItem[] } {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  const hasStart = typeof o.startType === "string";
  const hasQuestions = Array.isArray(o.questions);
  return hasStart || hasQuestions;
}

const FOOTER_BASE_HEIGHT = 64;
const SAFE_BOTTOM = 12;
const FEEDBACK_AREA_MIN_HEIGHT = 100;
const FOOTER_BUTTON_AREA_HEIGHT = FOOTER_BASE_HEIGHT + SAFE_BOTTOM;

function normalizeForCompare(s: string) {
  return s
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/\b(i|you|he|she|it|we|they)'m\b/gi, "$1 am")
    .replace(/\b(i|you|he|she|it|we|they)'re\b/gi, "$1 are")
    .replace(/\b(i|you|he|she|it|we|they)'ve\b/gi, "$1 have")
    .replace(/\b(i|you|he|she|it|we|they)'ll\b/gi, "$1 will")
    .replace(/\b(i|you|he|she|it|we|they)'d\b/gi, "$1 would")
    .replace(/\bcan't\b/gi, "cannot")
    .replace(/\bdon't\b/gi, "do not")
    .replace(/\bdoesn't\b/gi, "does not")
    .replace(/\bdidn't\b/gi, "did not")
    .replace(/\bwon't\b/gi, "will not")
    .replace(/\bisn't\b/gi, "is not")
    .replace(/\baren't\b/gi, "are not")
    .replace(/\bwasn't\b/gi, "was not")
    .replace(/\bweren't\b/gi, "were not")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { profile, setProfileLocal } = useProfile();

  const locState = isLocState(location.state)
    ? (location.state as {
        startType?: TrainingType;
        questions?: QuestionItem[];
      })
    : undefined;

  const rawStart = locState && (locState as Record<string, unknown>).startType;
  const startType =
    typeof rawStart === "string" ? (rawStart as TrainingType) : undefined;

  const [questions, setQuestions] = useState<QuestionItem[] | null>(
    locState?.questions ?? null
  );
  const [loading, setLoading] = useState<boolean>(
    !locState?.questions && Boolean(startType)
  );
  const [index, setIndex] = useState<number>(0);

  const [correctCount, setCorrectCount] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);

  // UI 상태
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [writingValue, setWritingValue] = useState<string>("");

  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  const [answerToShow, setAnswerToShow] = useState<string | null>(null);
  const [answerLabel, setAnswerLabel] = useState<string>("정답");

  const [finalTranscript, setFinalTranscript] = useState<string | null>(null);

  const [feedbackContentHeight, setFeedbackContentHeight] = useState(
    FEEDBACK_AREA_MIN_HEIGHT
  );
  const feedbackContentRef = useRef<HTMLDivElement>(null);

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
          setCorrectCount(0);
          setSessionScore(0);
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

  const currentQuestion: ExtendedQuestionItem | null = useMemo(
    () =>
      questions && questions[index]
        ? (questions[index] as ExtendedQuestionItem)
        : null,
    [questions, index]
  );

  const stableOptions = useMemo(() => {
    if (!currentQuestion) return [];
    if (currentQuestion.type === "writing") return [];
    return currentQuestion.options ? [...currentQuestion.options] : [];
  }, [currentQuestion]);

  const totalSteps = questions?.length ?? 0;
  const overallProgress =
    totalSteps === 0
      ? 0
      : ((showFeedback ? index + 1 : index) / Math.max(totalSteps, 1)) * 100;
  const isLastQuestion = index === (questions?.length ?? 1) - 1;

  const handleClose = () => {
    navigate("/home");
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setSelectedOrder([]);
    setWritingValue("");
    setShowFeedback(false);
    setIsCorrect(false);
    setVerifying(false);
    setAnswerToShow(null);
    setAnswerLabel("정답");
    setFinalTranscript(null);
    setFeedbackContentHeight(FEEDBACK_AREA_MIN_HEIGHT);
  };

  const handleSelect = (option: string) => {
    if (showFeedback || verifying) return;
    setSelectedAnswer(option);
  };
  const handlePickPart = (part: string) => {
    if (showFeedback || verifying) return;
    setSelectedOrder((s) => (s.includes(part) ? s : [...s, part]));
  };
  const handleRemovePart = (part: string) => {
    if (showFeedback || verifying) return;
    setSelectedOrder((s) => s.filter((x) => x !== part));
  };
  const handleReorder = (next: string[]) => {
    if (showFeedback || verifying) return;
    setSelectedOrder(next);
  };
  const handleWritingChange = (v: string) => {
    if (showFeedback || verifying) return;
    setWritingValue(v);
  };

  const arraysEqual = (a: string[], b: string[]) =>
    a.length === b.length &&
    a.every((v, i) => v.trim() === (b[i] ?? "").trim());

  // Speaking 완료 핸들러
  const handleSpeakingComplete = async (audioBlob: Blob) => {
    if (!currentQuestion) return;

    setVerifying(true);
    setShowFeedback(true);

    try {
      const result = await verifyAnswer({
        type: "speaking",
        userAnswer: audioBlob,
        correctAnswer: currentQuestion.correct ?? [],
      });

      setIsCorrect(result.isCorrect);

      if (result.transcript) {
        setFinalTranscript(result.transcript);
      }

      if (result.isCorrect) {
        setCorrectCount((prev) => prev + 1);
        setSessionScore((prev) => prev + result.points);
        setAnswerToShow(null);

        if (profile && (result.totalScore !== undefined || result.tier)) {
          setProfileLocal({
            ...profile,
            score: result.totalScore ?? profile.score,
            tier: result.tier ?? profile.tier,
          });
        }
      } else {
        setAnswerLabel("인식된 문장");
        setAnswerToShow(result.transcript ?? "인식 실패");
      }
    } catch (err) {
      console.error(err);
      setAnswerLabel("오류 발생");
      setAnswerToShow("채점 중 오류가 발생했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  // 정답 확인 핸들러 (핵심 수정 부분)
  const handleCheckAnswer = async () => {
    if (!currentQuestion || verifying) return;

    // UI 초기화
    setAnswerToShow(null);
    setAnswerLabel("정답");

    let userAnswerForBackend: string | string[] | Blob = "";
    let localCorrect = false;

    // 1. 사용자 입력 준비 및 로컬 채점(Writing, Speaking 제외)
    if (
      currentQuestion.type === "vocabulary" ||
      currentQuestion.type === "blank"
    ) {
      userAnswerForBackend = selectedAnswer ?? "";
      const correctField = currentQuestion.correct;
      localCorrect =
        typeof correctField === "string"
          ? correctField === selectedAnswer
          : Array.isArray(correctField)
          ? !!selectedAnswer && correctField.includes(selectedAnswer)
          : false;

      // 로컬 채점 결과 즉시 반영
      setIsCorrect(localCorrect);
      if (localCorrect) setCorrectCount((prev) => prev + 1);
      setShowFeedback(true);
    } else if (currentQuestion.type === "sentence") {
      userAnswerForBackend = selectedOrder;
      if (Array.isArray(currentQuestion.correct)) {
        localCorrect = arraysEqual(currentQuestion.correct, selectedOrder);
      } else if (typeof currentQuestion.correct === "string") {
        localCorrect = currentQuestion.correct === selectedOrder.join(" ");
      }

      setIsCorrect(localCorrect);
      if (localCorrect) setCorrectCount((prev) => prev + 1);
      setShowFeedback(true);
    } else if (currentQuestion.type === "writing") {
      userAnswerForBackend = writingValue;
      // Writing은 로컬 채점 건너뛰고 바로 Loading 상태로 진입
      setVerifying(true);
      setShowFeedback(true);
    }

    // 2. 서버 검증 요청
    try {
      const result = await verifyAnswer({
        type: currentQuestion.type,
        userAnswer: userAnswerForBackend,
        correctAnswer: currentQuestion.correct ?? [],
        extra: { questionText: currentQuestion.question }, // [추가] Writing 검증용
      });

      // 3. 결과 처리
      if (currentQuestion.type === "writing") {
        const serverCorrect = result.isCorrect;
        setIsCorrect(serverCorrect);

        if (serverCorrect) {
          setCorrectCount((prev) => prev + 1);
          setSessionScore((prev) => prev + result.points);

          // [핵심 로직] 정답이지만, 의도한 정답(Best Answer)과 표현이 다르면 알려주기
          const intended = Array.isArray(currentQuestion.correct)
            ? currentQuestion.correct[0]
            : currentQuestion.correct;

          const normUser = normalizeForCompare(writingValue);
          const normIntended = normalizeForCompare(intended || "");

          // 사용자가 맞았지만 의도한 정답과 텍스트가 다를 때
          if (intended && normUser !== normIntended) {
            setAnswerLabel("이런 표현도 있어요");
            setAnswerToShow(intended);
          } else {
            // 완벽히 일치하면 추가 텍스트 없음
            setAnswerToShow(null);
          }
        } else {
          // 오답인 경우 의도한 정답 보여주기
          setAnswerLabel("정답");
          setAnswerToShow(
            Array.isArray(currentQuestion.correct)
              ? currentQuestion.correct[0]
              : currentQuestion.correct ?? ""
          );
        }
      } else {
        // Writing 외 타입: 점수 업데이트 (UI는 이미 반영됨)
        if (result.isCorrect) {
          setSessionScore((prev) => prev + result.points);
        }
      }

      // 프로필 업데이트
      if (
        result.isCorrect &&
        profile &&
        (result.totalScore !== undefined || result.tier)
      ) {
        setProfileLocal({
          ...profile,
          score: result.totalScore ?? profile.score,
          tier: result.tier ?? profile.tier,
        });
      }
    } catch (err) {
      console.error("[Frontend] Verification failed", err);
      if (currentQuestion.type === "writing") {
        setIsCorrect(false);
        setAnswerLabel("오류");
        setAnswerToShow("채점 중 문제가 발생했습니다.");
      }
    } finally {
      setVerifying(false);
    }
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
    console.log("학습 종료. 결과 페이지로 이동");
    navigate("/training/result", {
      replace: true,
      state: {
        correctCount: correctCount,
        totalCount: questions?.length ?? 0,
        trainingType: startType,
        earnedScore: sessionScore,
      },
    });
  };

  useLayoutEffect(() => {
    if (showFeedback && feedbackContentRef.current) {
      const currentContentHeight = feedbackContentRef.current.scrollHeight;
      setFeedbackContentHeight(
        Math.max(currentContentHeight, FEEDBACK_AREA_MIN_HEIGHT)
      );
    }
  }, [
    showFeedback,
    isCorrect,
    currentQuestion?.correct,
    answerToShow,
    verifying,
    answerLabel,
  ]);

  const footerVisualHeight = showFeedback
    ? FOOTER_BUTTON_AREA_HEIGHT + feedbackContentHeight
    : FOOTER_BUTTON_AREA_HEIGHT;

  const MAIN_CONTENT_PADDING_BOTTOM =
    FOOTER_BUTTON_AREA_HEIGHT + feedbackContentHeight;

  const canCheck = useMemo(() => {
    if (!currentQuestion) return false;
    switch (currentQuestion.type) {
      case "sentence":
        return selectedOrder.length > 0;
      case "writing":
        return writingValue.trim().length > 0;
      case "speaking":
        return false;
      default:
        return selectedAnswer != null;
    }
  }, [currentQuestion, selectedOrder, writingValue, selectedAnswer]);

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
        <button
          onClick={() => navigate("/home")}
          className="mt-4 text-rose-500 font-bold"
        >
          홈으로 돌아가기
        </button>
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
            sentence={String(item.question ?? "")}
            value={writingValue}
            onChange={handleWritingChange}
            disabled={showFeedback || verifying}
          />
        );
      case "speaking":
        return (
          <Speaking
            key={item.id}
            prompt={item.question}
            onRecord={handleSpeakingComplete}
            serverTranscript={finalTranscript}
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
      {/* Header */}
      <header className="flex-none border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-600 rounded-md hover:bg-gray-100 transition"
            aria-label="닫기"
            type="button"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4 overflow-y-auto relative"
        style={{ paddingBottom: `${MAIN_CONTENT_PADDING_BOTTOM}px` }}
      >
        {showFeedback && (
          <div
            className="absolute inset-0 bg-transparent"
            style={{ zIndex: 30, pointerEvents: "auto" }}
            aria-hidden="true"
          />
        )}

        <fieldset
          disabled={showFeedback || verifying}
          className="w-full flex flex-col gap-4 h-full"
        >
          {renderQuestionComponent(currentQuestion)}
          <div className="flex-1" />
        </fieldset>
      </main>

      {/* Footer / Feedback */}
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
          {/* Feedback card */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ease-out ${
              showFeedback ? "translate-y-0" : "translate-y-full"
            } ${
              verifying
                ? "bg-gray-50 border-t border-gray-200"
                : isCorrect
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
              ref={feedbackContentRef}
              className="max-w-4xl mx-auto w-full flex items-start gap-3 p-4"
              style={{ minHeight: `${FEEDBACK_AREA_MIN_HEIGHT}px` }}
            >
              {showFeedback && (
                <>
                  {verifying ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                      <span className="text-gray-600 font-semibold">
                        채점 중입니다...
                      </span>
                    </div>
                  ) : (
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

                        {/* 피드백 텍스트 (정답표시 or 이런표현도있어요) */}
                        {((!isCorrect && currentQuestion.type !== "speaking") ||
                          (isCorrect && answerToShow) || // 정답이지만 "이런 표현도 있어요" 보여줄 때
                          (!isCorrect &&
                            currentQuestion.type === "speaking")) && (
                          <div className="mt-1">
                            <div className="text-sm text-gray-600">
                              {answerLabel}
                            </div>
                            <div className="text-base font-bold text-gray-900 mt-1 break-keep">
                              {answerToShow}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
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
                {verifying ? (
                  <button
                    disabled
                    className="w-full h-12 rounded-xl font-semibold text-base bg-gray-200 text-gray-400 cursor-wait flex items-center justify-center gap-2"
                    style={{ pointerEvents: "auto" }}
                  >
                    채점 중...
                  </button>
                ) : !showFeedback ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={
                      !canCheck ||
                      currentQuestion.type === "speaking" ||
                      verifying
                    }
                    className={`w-full h-12 rounded-xl font-semibold text-base transition duration-200 ${
                      canCheck &&
                      currentQuestion.type !== "speaking" &&
                      !verifying
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 active:scale-[.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    style={{ pointerEvents: "auto" }}
                  >
                    {currentQuestion.type === "speaking"
                      ? "말하기를 완료하세요"
                      : "정답 확인"}
                  </button>
                ) : isLastQuestion ? (
                  <button
                    onClick={handleTrainingComplete}
                    className={`w-full h-12 rounded-xl font-semibold text-base transition duration-200 text-white shadow-lg active:scale-[.98] ${
                      isCorrect
                        ? "bg-green-600 shadow-green-500/20"
                        : "bg-rose-600 shadow-rose-500/20"
                    }`}
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
