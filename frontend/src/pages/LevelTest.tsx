import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Mic, Volume2 } from "lucide-react";

type TestStep = "intro" | "vocabulary" | "grammar" | "speaking" | "result";

type Question = {
  question: string;
  options: string[];
  correct: string;
  sentence?: string;
};

const vocabularyQuestions: Question[] = [
  {
    question: '다음 단어의 뜻은 무엇인가요? "Delicious"',
    options: ["맛있는", "아름다운", "빠른", "큰"],
    correct: "맛있는",
  },
  {
    question: '"Excited"의 의미는?',
    options: ["피곤한", "신나는", "슬픈", "화난"],
    correct: "신나는",
  },
  {
    question: '"Frequently"는 무슨 뜻인가요?',
    options: ["가끔", "자주", "절대", "항상"],
    correct: "자주",
  },
];

const grammarQuestions: Question[] = [
  {
    question: "올바른 문장을 고르세요:",
    options: [
      "She go to school every day",
      "She goes to school every day",
      "She going to school every day",
      "She gone to school every day",
    ],
    correct: "She goes to school every day",
  },
  {
    question: "빈칸에 들어갈 알맞은 단어는?",
    sentence: "I ___ been to Paris before.", // ✅ 이제 타입에 맞음
    options: ["has", "have", "had", "having"],
    correct: "have",
  },
];

export default function LevelTestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<TestStep>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("");

  const progress = {
    intro: 0,
    vocabulary: 33,
    grammar: 66,
    speaking: 85,
    result: 100,
  };

  const handleStart = () => setStep("vocabulary");

  const handleAnswer = () => {
    const currentQuestions =
      step === "vocabulary" ? vocabularyQuestions : grammarQuestions;
    const isCorrect =
      selectedAnswer === currentQuestions[currentQuestion].correct;
    if (isCorrect) setScore(score + 1);

    setAnswers({ ...answers, [`${step}-${currentQuestion}`]: selectedAnswer });
    setSelectedAnswer("");

    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (step === "vocabulary") {
        setStep("grammar");
        setCurrentQuestion(0);
      } else if (step === "grammar") {
        setStep("speaking");
      }
    }
  };

  const handleSpeakingComplete = () => {
    const total = vocabularyQuestions.length + grammarQuestions.length;
    const percentage = (score / total) * 100;
    const calculatedLevel =
      percentage >= 80
        ? "B2"
        : percentage >= 60
        ? "B1"
        : percentage >= 40
        ? "A2"
        : "A1";

    setLevel(calculatedLevel);
    setStep("result");

    sessionStorage.setItem("userLevel", calculatedLevel);
    sessionStorage.setItem("testScore", score.toString());
  };

  const handleGoToSignup = () => {
    sessionStorage.setItem("levelTestResult", level);
    navigate("/signup");
  };

  // ---------------- Intro ----------------
  if (step === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="max-w-2xl w-full border-2 border-rose-300 rounded-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-rose-500">
              레벨 테스트
            </h1>
            <p className="text-lg text-gray-600">
              당신의 영어 실력을 측정해보세요
            </p>
          </div>

          <div className="space-y-4">
            {[
              { step: "단어 테스트", desc: "기본 어휘력을 확인합니다" },
              {
                step: "문법 테스트",
                desc: "문장 구조와 문법 이해도를 평가합니다",
              },
              {
                step: "스피킹 테스트",
                desc: "AI와 대화하며 회화 능력을 측정합니다",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.step}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full h-12 bg-rose-500 text-white rounded-lg text-lg font-semibold hover:bg-rose-600"
          >
            테스트 시작하기
          </button>
          <p className="text-center text-sm text-gray-400">
            소요 시간: 약 5-7분
          </p>
        </div>
      </div>
    );
  }

  // ---------------- Vocabulary / Grammar ----------------
  if (step === "vocabulary" || step === "grammar") {
    const questions =
      step === "vocabulary" ? vocabularyQuestions : grammarQuestions;
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{step === "vocabulary" ? "단어 테스트" : "문법 테스트"}</span>
            <span>
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${progress[step]}%` }}
            />
          </div>

          <div className="border-2 border-rose-300 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold">{question.question}</h2>
            {question.sentence && (
              <p className="text-lg text-gray-500">{question.sentence}</p>
            )}

            <div className="space-y-3">
              {question.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${
                    selectedAnswer === option
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-300 hover:border-rose-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="option"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => setSelectedAnswer(option)}
                    className="mr-3"
                  />
                  <span className="text-base">{option}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleAnswer}
              disabled={!selectedAnswer}
              className="w-full h-12 bg-rose-500 text-white rounded-lg text-lg font-semibold disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Speaking ----------------
  if (step === "speaking") {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>스피킹 테스트</span>
            <span>AI 대화 진행 중</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all"
              style={{ width: `${progress[step]}%` }}
            />
          </div>

          <div className="border-2 border-rose-300 rounded-xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">AI와 대화해보세요</h2>
              <p className="text-base text-gray-500">
                자연스러운 대화를 통해 회화 능력을 평가합니다
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Volume2 className="w-6 h-6 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold mb-1">AI 튜터</p>
                  <p className="text-sm">
                    Hello! Tell me about your favorite hobby. What do you like
                    to do in your free time?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 py-8">
              <button className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95">
                <Mic className="w-12 h-12" />
              </button>
              <p className="text-sm text-gray-500">
                마이크 버튼을 눌러 답변하세요
              </p>
            </div>

            <button
              onClick={handleSpeakingComplete}
              className="w-full h-12 border border-rose-500 text-rose-500 rounded-lg text-lg font-semibold hover:bg-rose-50"
            >
              테스트 완료하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Result ----------------
  if (step === "result") {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full border-2 border-rose-300 rounded-xl p-8 space-y-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">테스트 완료!</h2>
            <p className="text-gray-600">
              당신의 레벨은{" "}
              <span className="text-rose-500 font-semibold">{level}</span>{" "}
              입니다.
            </p>
          </div>

          <div className="text-left text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="mb-1">총 점수: {score}점</p>
            <p>레벨: {level}</p>
          </div>

          <button
            onClick={handleGoToSignup}
            className="w-full h-12 bg-rose-500 text-white rounded-lg text-lg font-semibold hover:bg-rose-600"
          >
            회원가입 하러 가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
