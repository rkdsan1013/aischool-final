// backend/src/services/trainingService.ts
import { nanoid } from "nanoid";
import { generateVocabularyQuestionsRaw } from "../llm/models/vocabularyModel";
// (나중에 추가될 다른 모델들)
// import { generateSentenceQuestionsRaw } from "../llm/models/sentenceModel";

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
  options?: string[] | undefined; // | undefined 추가
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

// --- [헬퍼 함수] ---
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

  shuffleArray(options); // <--- 셔플!

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
  // --- [수정됨] ---
  // exactOptionalPropertyTypes: true 규칙을 위해 | undefined 추가
  opts?: { level?: string | undefined; level_progress?: number | undefined }
  // --- [수정 완료] ---
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
          // case "sentence":
          //   raw = await generateSentenceQuestionsRaw(level, level_progress);
          //   break;
          // (다른 유형들...)
          default:
            // 지원하지 않는 유형이거나, LLM 호출이 필요 없는 유형 (writing, speaking 등)
            return DUMMY[type] ?? [];
        }
        // --- 호출 완료 ---

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

    const items = (parsed as any[]).slice(0, 10);

    // --- 정규화 로직 ---
    const normalized: QuestionItem[] = items.map((item: any) => {
      const id = nanoid();

      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      // 'vocabulary'와 'blank'는 이 정규화 로직을 공유할 수 있습니다.
      // 'sentence'는 다른 정규화 함수가 필요할 수 있습니다.
      const { options, correct } = normalizeOptionsAndCorrect(item);

      const q: QuestionItem = {
        id,
        type: type, // 'vocabulary' 하드코딩 대신 'type' 변수 사용
        question: question,
        options,
        correct: correct,
      };

      if (!q.options?.includes(q.correct as string)) {
        q.correct = q.options?.[0];
      }

      return q;
    });
    // --- 정규화 완료 ---

    // 패딩 보장 (모델이 10개 미만 반환 시)
    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: type,
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
      `[TRAINING SERVICE] Error in getQuestionsByType (${type}):`,
      err
    );
    return DUMMY[type] ?? [];
  }
}
