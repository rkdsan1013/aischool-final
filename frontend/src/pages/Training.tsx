import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Vocabulary from "../components/Vocabulary";
// import SentenceArrange from "../components/SentenceArrange";
// import BlankQuiz from "../components/BlankQuiz";
// import Writing from "../components/Writing";
// import SpeakingListening from "../components/SpeakingListening";

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

const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const { section } = useParams(); // URL에서 /training/:section 추출
  const [completedTypes, setCompletedTypes] = useState<TrainingType[]>([]);

  const currentType = (section as TrainingType) || "vocabulary";
  const currentIndex = trainingSequence.indexOf(currentType);
  const overallProgress = ((currentIndex + 1) / trainingSequence.length) * 100;

  const handleTrainingComplete = () => {
    const nextIndex = currentIndex + 1;
    setCompletedTypes((prev) => [...prev, currentType]);

    if (nextIndex < trainingSequence.length) {
      const nextType = trainingSequence[nextIndex];
      navigate(`/home/training/${nextType}`);
    } else {
      alert("모든 훈련을 완료했습니다!");
      navigate("/home");
    }
  };

  const handleClose = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="닫기"
              type="button"
            >
              <svg
                className="w-5 h-5"
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

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">
                {currentIndex + 1} / {trainingSequence.length}
              </span>
              <div className="w-32 sm:w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500 ease-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentType === "vocabulary" && (
          <Vocabulary onComplete={handleTrainingComplete} />
        )}
        {/* {currentType === "sentence" && (
          <SentenceArrange onComplete={handleTrainingComplete} />
        )}
        {currentType === "blank" && (
          <BlankQuiz onComplete={handleTrainingComplete} />
        )}
        {currentType === "writing" && (
          <Writing onComplete={handleTrainingComplete} />
        )}
        {currentType === "speakingListening" && (
          <SpeakingListening onComplete={handleTrainingComplete} />
        )} */}
      </main>
    </div>
  );
};

export default TrainingPage;
