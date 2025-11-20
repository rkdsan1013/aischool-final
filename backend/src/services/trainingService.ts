// backend/src/services/trainingService.ts
import { nanoid } from "nanoid";
import { generateVocabularyQuestionsRaw } from "../llm/models/vocabularyModel";
import { generateSentenceQuestionsRaw } from "../llm/models/sentenceModel";
import { generateBlankQuestionsRaw } from "../llm/models/blankModel";
import { generateWritingQuestionsRaw } from "../llm/models/writingModel";

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

// DUMMY 데이터 (생략 - 기존과 동일)
const DUMMY: Record<TrainingType, QuestionItem[]> = {
  vocabulary: [],
  sentence: [],
  blank: [],
  writing: [],
  speaking: [],
};

// --- [헬퍼 함수] ---
// (shuffleArray, normalizeOptionsAndCorrect, cleanString 등 기존과 동일)
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
  // (기존 로직 동일)
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
  if (!options.includes(correctCandidate)) options[0] = correctCandidate;
  return { options, correct: correctCandidate };
}
// --- [헬퍼 함수 완료] ---

export async function getQuestionsByType(
  type: TrainingType,
  opts?: { level?: string | undefined; level_progress?: number | undefined }
): Promise<QuestionItem[]> {
  const level: string | undefined =
    typeof opts?.level === "string" ? opts.level : undefined;
  const level_progress: number | undefined =
    typeof opts?.level_progress === "number" ? opts.level_progress : undefined;

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
          default:
            return DUMMY[type] ?? [];
        }

        try {
          parsed = JSON.parse(String(raw));
        } catch (err) {
          // ... (기존 파싱 재시도 로직 동일) ...
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
        // ... (에러 처리 로직) ...
      }
    }

    if (!Array.isArray(parsed)) {
      return DUMMY[type] ?? [];
    }

    const items = (parsed as any[]).slice(0, 10);
    let normalized: QuestionItem[];

    // --- [수정됨] 유형별 정규화 로직 ---
    if (type === "vocabulary" || type === "blank") {
      // (기존 로직 동일)
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question = item?.question
          ? String(item.question).trim()
          : "(unknown)";
        const { options, correct } = normalizeOptionsAndCorrect(item);
        return { id, type, question, options, correct };
      });
    } else if (type === "sentence") {
      // (기존 로직 동일)
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
      // --- [수정됨] writing 유형 매핑 ---
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question = item?.question
          ? String(item.question).trim()
          : "(unknown question)";

        // correct는 문자열 배열이어야 함
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
          question: question, // 한국어 문장
          options: [], // 작문은 보기 없음
          correct: correctArr, // 정답 문장 배열 (여러 표현 허용)
        };
      });
      // --- [수정 완료] ---
    } else {
      return DUMMY[type] ?? [];
    }

    // 패딩 보장
    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        const isSentence = type === "sentence";
        const isWriting = type === "writing";

        padded.push({
          id: nanoid(),
          type,
          question: `(random pad ${i + 1})`,
          options:
            isSentence || isWriting
              ? []
              : ["(pad1)", "(pad2)", "(pad3)", "(pad4)"],
          correct: isSentence || isWriting ? [] : "(pad1)",
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
