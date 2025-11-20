import { nanoid } from "nanoid";
import { generateVocabularyQuestionsRaw } from "../llm/models/vocabularyModel";
import { generateSentenceQuestionsRaw } from "../llm/models/sentenceModel";
import { generateBlankQuestionsRaw } from "../llm/models/blankModel";
import { generateWritingQuestionsRaw } from "../llm/models/writingModel";
import { generateSpeakingQuestionsRaw } from "../llm/models/speakingModel";

export type TrainingType =
  | "vocabulary"
  | "sentence"
  | "blank"
  | "writing"
  | "speaking";

export interface QuestionItem {
  id: string;
  type: TrainingType;
  question: string;
  options?: string[] | undefined;
  correct?: string | string[] | undefined;
}

// DUMMY 데이터 (LLM 실패 시 fallback)
const DUMMY: Record<TrainingType, QuestionItem[]> = {
  vocabulary: [
    {
      id: "v1",
      type: "vocabulary",
      question: "사과",
      options: ["Apple", "Banana", "Orange", "Grape"],
      correct: "Apple",
    },
  ],
  sentence: [
    {
      id: "s1",
      type: "sentence",
      question: "나는 배고프다",
      options: ["I", "hungry", "am", "is", "happy"],
      correct: ["I", "am", "hungry"],
    },
  ],
  blank: [],
  writing: [],
  speaking: [],
};

// --- [헬퍼 함수] ---
function cleanString(s: string): string {
  return s.trim().replace(/[.,!?]$/, "");
}

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

function normalizeOptionsAndCorrect(item: unknown): {
  options: string[];
  correct: string;
} {
  const rawOptions: string[] = Array.isArray((item as any)?.options)
    ? (item as any).options
        .map((o: any) => cleanString(String(o ?? "")))
        .filter((s: string) => s !== "")
    : [];

  let correctCandidate: string =
    typeof (item as any)?.correct === "string"
      ? cleanString(String((item as any).correct))
      : "";

  const deduped: string[] = Array.from(new Set(rawOptions));
  if (correctCandidate !== "" && !deduped.includes(correctCandidate)) {
    deduped.unshift(correctCandidate);
  }
  let options = deduped.slice(0, 4);
  while (options.length < 4) options.push("(unknown)");
  if (correctCandidate === "") correctCandidate = options[0]!;

  shuffleArray(options);

  if (!options.includes(correctCandidate)) {
    options[0] = correctCandidate;
  }
  return { options, correct: correctCandidate };
}

/**
 * 정답 검증 로직
 */
export function verifyUserAnswer(
  type: TrainingType,
  userAnswer: string | string[],
  correctAnswer: string | string[]
): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  if (type === "vocabulary" || type === "blank") {
    return normalize(String(userAnswer)) === normalize(String(correctAnswer));
  } else if (type === "sentence") {
    if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
      if (userAnswer.length !== correctAnswer.length) return false;
      return userAnswer.every(
        // --- [수정됨] ---
        // correctAnswer[idx]가 undefined일 경우 빈 문자열로 처리하여 타입 오류 해결
        (word, idx) => normalize(word) === normalize(correctAnswer[idx] ?? "")
        // --- [수정 완료] ---
      );
    }
    return normalize(String(userAnswer)) === normalize(String(correctAnswer));
  } else if (type === "writing") {
    const user = normalize(String(userAnswer));
    const correctCandidates = Array.isArray(correctAnswer)
      ? correctAnswer
      : [String(correctAnswer)];
    return correctCandidates.some((candidate) => normalize(candidate) === user);
  } else if (type === "speaking") {
    return true;
  }
  return false;
}
// --- [헬퍼 함수 완료] ---

/**
 * getQuestionsByType
 * LLM 호출, 재시도, 파싱, 정규화, 패딩 통합
 */
export async function getQuestionsByType(
  type: TrainingType,
  opts?: { level?: string | undefined; level_progress?: number | undefined }
): Promise<QuestionItem[]> {
  // undefined가 될 수 없도록 기본값을 여기서 강제 할당
  const level: string = typeof opts?.level === "string" ? opts.level : "C2";

  const level_progress: number =
    typeof opts?.level_progress === "number" ? opts.level_progress : 50;

  const MAX_RETRIES = 3;
  let parsed: unknown = null;
  let lastError: Error | null = null;
  let raw: string = "";

  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        switch (type) {
          case "vocabulary":
            raw = await generateVocabularyQuestionsRaw(level, level_progress);
            break;
          case "sentence":
            raw = await generateSentenceQuestionsRaw(level, level_progress);
            break;
          case "blank":
            raw = await generateBlankQuestionsRaw(level, level_progress);
            break;
          case "writing":
            raw = await generateWritingQuestionsRaw(level, level_progress);
            break;
          case "speaking":
            raw = await generateSpeakingQuestionsRaw(level, level_progress);
            break;
          default:
            return DUMMY[type] ?? [];
        }

        try {
          parsed = JSON.parse(String(raw));
        } catch (err) {
          const match = String(raw).match(/\[[\s\S]*\]/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (e) {
              parsed = null;
            }
          } else {
            parsed = null;
          }
        }

        if (Array.isArray(parsed)) {
          lastError = null;
          break;
        } else {
          lastError = new Error("Parsed result is not array");
        }
      } catch (llmError) {
        lastError = llmError as Error;
        console.error(
          `[TRAINING SERVICE] Attempt ${attempt} failed:`,
          llmError
        );
      }
    }

    if (!Array.isArray(parsed)) {
      console.error(
        `[TRAINING SERVICE] All ${MAX_RETRIES} attempts failed. Last error:`,
        lastError
      );
      return DUMMY[type] ?? [];
    }

    const items = (parsed as any[]).slice(0, 10);
    let normalized: QuestionItem[];

    // --- 유형별 정규화 로직 ---
    if (type === "vocabulary" || type === "blank") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question = item?.question
          ? String(item.question).trim()
          : "(unknown)";
        const { options, correct } = normalizeOptionsAndCorrect(item);
        return { id, type, question, options, correct };
      });
    } else if (type === "sentence") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question = item?.question
          ? String(item.question).trim()
          : "(unknown)";

        const correctWords = Array.isArray(item?.correct)
          ? item.correct.map((s: any) => cleanString(String(s)))
          : [];

        const distractorWords = Array.isArray(item?.options)
          ? item.options.map((s: any) => cleanString(String(s)))
          : [];

        const finalOptions = [...correctWords, ...distractorWords];
        shuffleArray(finalOptions);

        return {
          id,
          type,
          question,
          options: finalOptions,
          correct: correctWords,
        };
      });
    } else if (type === "writing") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question = item?.question
          ? String(item.question).trim()
          : "(unknown question)";

        let correctArr: string[] = [];
        if (Array.isArray(item?.correct)) {
          correctArr = item.correct
            .map(String)
            .filter((s: string) => s.trim() !== "");
        } else if (typeof item?.correct === "string") {
          correctArr = [item.correct];
        }

        return {
          id,
          type: "writing",
          question: question,
          options: [],
          correct: correctArr,
        };
      });
    } else if (type === "speaking") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question = item?.question
          ? String(item.question).trim()
          : "(unknown question)";

        return {
          id,
          type: "speaking",
          question: question,
          options: [],
          correct: question,
        };
      });
    } else {
      return DUMMY[type] ?? [];
    }

    // 패딩 보장
    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        const isSentence = type === "sentence";
        const isWriting = type === "writing";
        const isSpeaking = type === "speaking";

        let options: string[] = [];
        let correct: string | string[] = "(pad)";

        if (isSentence) {
          options = [];
          correct = [];
        } else if (isWriting) {
          options = [];
          correct = ["(pad)"];
        } else if (isSpeaking) {
          options = [];
          correct = "(pad)";
        } else {
          options = ["(pad1)", "(pad2)", "(pad3)", "(pad4)"];
          correct = "(pad1)";
        }

        padded.push({
          id: nanoid(),
          type,
          question: `(random pad ${i + 1})`,
          options: options,
          correct: correct,
        });
      }
      return padded;
    }

    return normalized;
  } catch (err) {
    console.error(`[TRAINING SERVICE] Error:`, err);
    return DUMMY[type] ?? [];
  }
}
