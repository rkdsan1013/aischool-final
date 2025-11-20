import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, CheckCircle, Home, RotateCcw } from "lucide-react";

interface ResultState {
  correctCount: number;
  totalCount: number;
  trainingType?: string; // 학습 유형 (vocabulary, sentence 등)
  earnedScore: number;
}

const TrainingResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as ResultState;

  // 잘못된 접근 시 홈으로 리다이렉트
  useEffect(() => {
    if (!state || typeof state.correctCount !== "number") {
      navigate("/home", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { correctCount, totalCount, trainingType, earnedScore } = state;
  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  // --- [수정됨] 다시 하기 핸들러 ---
  const handleRetry = () => {
    if (trainingType) {
      // 해당 학습 유형을 가지고 다시 훈련 페이지로 이동 (기록 대체)
      navigate("/training", {
        state: { startType: trainingType },
        replace: true,
      });
    } else {
      // 유형 정보가 없으면 홈으로
      navigate("/home");
    }
  };
  // --- [수정 완료] ---

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 1. 아이콘 및 헤더 */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-yellow-100 rounded-full scale-150 animate-pulse" />
            <div className="relative bg-yellow-50 p-6 rounded-full border-4 border-yellow-100">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lesson Complete!
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {trainingType
                ? `${trainingType} 학습을 완료했습니다.`
                : "학습을 완료했습니다."}
            </p>
          </div>
        </div>

        {/* 2. 결과 카드 */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total XP Earned
            </div>
            <div className="text-5xl font-black text-rose-500 tracking-tight">
              +{earnedScore}
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full" />

          <div className="flex items-center justify-between px-4">
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm font-medium mb-1">
                Correct
              </span>
              <span className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                {correctCount} / {totalCount}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm font-medium mb-1">
                Accuracy
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* 3. 하단 버튼 */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            홈으로
          </button>

          <button
            // [수정됨] navigate(-1) 대신 handleRetry 사용
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            다시 하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingResult;
