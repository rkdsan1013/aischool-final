// backend/src/services/trainingService.ts
import { nanoid } from "nanoid";
import { generateVocabularyQuestionsRaw } from "../llm/models/vocabularyModel";

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
  options?: string[];
  correct?: string | string[] | undefined;
}

// DUMMY는 vocabulary가 아닌 다른 타입 요청 시 사용됩니다.
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
      question: "배고파 I am",
      options: ["I", "am", "hungry"],
      correct: ["I", "am", "hungry"],
    },
  ],
  blank: [
    {
      id: "b1",
      type: "blank",
      question: "She ____ to school every day. (go)",
      options: ["go", "goes", "going", "went"],
      correct: "goes",
    },
  ],
  writing: [
    {
      id: "w1",
      type: "writing",
      question: "자기소개를 영어로 한 문장으로 작성하세요.",
      options: [],
      correct: "",
    },
  ],
  speaking: [
    {
      id: "sp1",
      type: "speaking",
      question: "따라 말해보세요: How's the weather today?",
      correct: "",
    },
  ],
};

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

/**
 * 유틸리티 (배열 섞기)
 */
function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/**
 * getQuestionsByType
 * - vocabulary일 때 opts로 level/level_progress를 받아 LLM 호출
 * - words 입력은 받지 않음
 */
export async function getQuestionsByType(
  type: TrainingType,
  opts?: { level?: string; level_progress?: number }
): Promise<QuestionItem[]> {
  if (type !== "vocabulary") {
    return DUMMY[type] ?? [];
  }

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
        raw = await generateVocabularyQuestionsRaw(level, level_progress);

        // 1. 파싱 시도 (직접)
        try {
          parsed = JSON.parse(String(raw));
        } catch (err) {
          console.warn(
            `[TRAINING SERVICE] Attempt ${attempt}/${MAX_RETRIES}: JSON.parse failed on raw:`,
            err
          );
          // 2. 파싱 시도 (서브스트링 추출)
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
              parsed = null; // 실패
            }
          } else {
            console.warn(
              `[TRAINING SERVICE] Attempt ${attempt}/${MAX_RETRIES}: no JSON array substring found`
            );
            lastError = new Error("No JSON array substring found");
            parsed = null; // 실패
          }
        }

        // 3. 파싱 결과 확인
        if (Array.isArray(parsed)) {
          lastError = null; // 성공
          break; // 재시도 루프 탈출
        } else {
          lastError = new Error("Parsed result is not array");
        }
      } catch (llmError) {
        // LLM 호출 자체의 실패 (네트워크 오류 등)
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
      return DUMMY.vocabulary ?? [];
    }

    const items = (parsed as any[]).slice(0, 10);

    const normalized: QuestionItem[] = items.map((item: any) => {
      // 안전한 옵션 배열 생성
      const rawOptions: string[] = Array.isArray(item?.options)
        ? (item.options as any[])
            .map((o: any) => String(o ?? "").trim())
            .filter((s: string) => s !== "")
        : [];

      const deduped = Array.from(new Set(rawOptions));
      let options = deduped.slice(0, 4);
      while (options.length < 4) options.push("(unknown)");

      const correctCandidate: string =
        typeof item?.correct === "string" && String(item.correct).trim() !== ""
          ? String(item.correct).trim()
          : options[0]!;

      shuffleArray(options);

      if (!options.includes(correctCandidate)) {
        options[0] = correctCandidate;
      }

      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      const q: QuestionItem = {
        id: nanoid(),
        type: "vocabulary",
        question: question,
        options,
        correct: correctCandidate,
      };

      return q;
    });

    // 패딩 보장 (모델이 10개 미만 반환 시)
    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: "vocabulary",
          question: `(random word ${i + 1})`,
          options: ["(unknown1)", "(unknown2)", "(unknown3)", "(unknown4)"],
          correct: "(unknown1)",
        });
      }
      return padded;
    }

    return normalized;
  } catch (err) {
    console.error(
      "[TRAINING SERVICE] Error calling LLM for vocabulary questions:",
      err
    );
    return DUMMY.vocabulary ?? [];
  }
}
