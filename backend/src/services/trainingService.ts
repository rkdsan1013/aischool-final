// backend/src/services/trainingService.ts
import { nanoid } from "nanoid";
import { generateVocabularyQuestionsRaw } from "../llm/models/vocabularyModel";
import { generateSentenceQuestionsRaw } from "../llm/models/sentenceModel";

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

// ... (DUMMY 데이터는 동일) ...
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
      options: ["I", "hungry", "am", "is", "happy"], // 오답이 포함된 DUMMY 예시
      correct: ["I", "am", "hungry"],
    },
  ],
  blank: [],
  writing: [],
  speaking: [],
};

// --- [헬퍼 함수] ---
function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/**
 * 'vocabulary'와 'blank' 전용 정규화 함수
 */
function normalizeOptionsAndCorrect(item: unknown): {
  options: string[];
  correct: string;
} {
  // ... (이 함수는 수정 없이 그대로 사용) ...
  const rawOptions: string[] = Array.isArray((item as any)?.options)
    ? (item as any).options
        .map((o: any) => String(o ?? "").trim())
        .filter((s: string) => s !== "")
    : [];
  let correctCandidate: string =
    typeof (item as any)?.correct === "string"
      ? String((item as any).correct).trim()
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
// --- [헬퍼 함수 완료] ---

/**
 * getQuestionsByType
 * LLM 호출, 재시도, 파싱, 정규화, 패딩을 모두 담당
 */
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
        // --- type에 따라 다른 모델 호출 ---
        switch (type) {
          case "vocabulary":
            raw = await generateVocabularyQuestionsRaw(level, level_progress);
            break;
          case "sentence":
            raw = await generateSentenceQuestionsRaw(level, level_progress);
            break;
          // (다른 유형들...)
          default:
            return DUMMY[type] ?? [];
        }
        // --- 호출 완료 ---

        // ... (파싱 및 재시도 로직은 동일) ...
        try {
          parsed = JSON.parse(String(raw));
        } catch (err) {
          console.warn(
            `[TRAINING SERVICE] Attempt ${attempt}/${MAX_RETRIES}: JSON.parse failed on raw:`,
            err
          );
          const match = String(raw).match(/\[[\s\S]*\]/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (err2) {
              console.error(
                `[TRAINING SERVICE] Attempt ${attempt}/${MAX_RETRIES}: parsing extracted substring failed:`,
                err2
              );
              lastError = err2 as Error;
              parsed = null;
            }
          } else {
            console.warn(
              `[TRAINING SERVICE] Attempt ${attempt}/${MAX_RETRIES}: no JSON array substring found`
            );
            lastError = new Error("No JSON array substring found");
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
        console.error(
          `[TRAINING SERVICE] Attempt ${attempt}/${MAX_RETRIES}: LLM call failed:`,
          llmError
        );
        lastError = llmError as Error;
      }
    }

    if (!Array.isArray(parsed)) {
      console.error(
        `[TRAINING SERVICE] All ${MAX_RETRIES} attempts failed, falling back to DUMMY. Last error:`,
        lastError
      );
      return DUMMY[type] ?? [];
    }
    // ... (파싱 완료) ...

    const items = (parsed as any[]).slice(0, 10);

    // --- [수정됨] 유형별 정규화 로직 분리 ---
    let normalized: QuestionItem[];

    if (type === "vocabulary" || type === "blank") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question =
          typeof item?.question === "string" && item.question.trim() !== ""
            ? item.question.trim()
            : "(unknown question)";

        const { options, correct } = normalizeOptionsAndCorrect(item);

        return {
          id,
          type: type,
          question: question,
          options,
          correct: correct,
        };
      });
    } else if (type === "sentence") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question =
          typeof item?.question === "string" && item.question.trim() !== ""
            ? item.question.trim()
            : "(unknown question)";

        // 1. 'correct' 배열 (정답)
        const correctWords: string[] = Array.isArray(item?.correct)
          ? item.correct.map(String).filter((s: string) => s !== "")
          : [];

        // 2. 'options' 배열 (LLM이 준 '오답'만)
        const distractorWords: string[] = Array.isArray(item?.options)
          ? item.options.map(String).filter((s: string) => s !== "")
          : [];

        // 3. 정답 단어 + 오답 단어 병합
        const finalOptions = [...correctWords, ...distractorWords];

        // 4. 최종 단어 뱅크 셔플
        shuffleArray(finalOptions);

        return {
          id,
          type: "sentence",
          question: question,
          options: finalOptions, // 셔플된 전체 단어 뱅크
          correct: correctWords, // 정답 순서의 배열
        };
      });
    } else {
      return DUMMY[type] ?? [];
    }
    // --- [수정 완료] ---

    // 패딩 보장 (모델이 10개 미만 반환 시)
    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        const isSentence = type === "sentence";
        padded.push({
          id: nanoid(),
          type: type,
          question: `(random pad ${i + 1})`,
          options: isSentence ? [] : ["(pad1)", "(pad2)", "(pad3)", "(pad4)"],
          correct: isSentence ? [] : "(pad1)",
        });
      }
      return padded;
    }

    return normalized;
  } catch (err) {
    console.error(
      `[TRAINING SERVICE] Error in getQuestionsByType (${type}):`,
      err
    );
    return DUMMY[type] ?? [];
  }
}
