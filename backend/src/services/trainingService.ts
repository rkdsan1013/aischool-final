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
 * getQuestionsByType
 * - vocabulary일 때 opts로 level/level_progress를 받아 LLM 호출
 * - words 입력은 받지 않음
 */
export async function getQuestionsByType(
  type: TrainingType,
  opts?: { level?: string; level_progress?: number } // [수정됨] words 제거
): Promise<QuestionItem[]> {
  if (type !== "vocabulary") {
    return DUMMY[type] ?? [];
  }

  // [수정됨] inputWords 로직 완전 제거
  // --- [수정됨] ---
  // 기본값을 "C1"에서 "C2"로 변경
  const level: string = typeof opts?.level === "string" ? opts!.level : "C2";
  // --- [수정 완료] ---
  let level_progress: number =
    typeof opts?.level_progress === "number" ? opts!.level_progress : 50;
  if (Number.isNaN(level_progress) || level_progress < 0) level_progress = 0;
  if (level_progress > 100) level_progress = 100;

  try {
    console.log(
      `[TRAINING SERVICE] requesting random vocabulary`,
      "level:",
      level,
      "level_progress:",
      level_progress
    );

    // [수정됨] 모델 호출 시 words 제거
    const raw: string = await generateVocabularyQuestionsRaw(
      level,
      level_progress
    );

    console.log("[TRAINING SERVICE] raw response length:", String(raw).length);
    console.log(
      "[TRAINING SERVICE] raw response preview:",
      String(raw).slice(0, 800)
    );

    // 파싱
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(String(raw));
      console.log("[TRAINING SERVICE] parsed JSON directly");
    } catch (err) {
      console.warn("[TRAINING SERVICE] JSON.parse failed on raw:", err);
      const match = String(raw).match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
          console.log(
            "[TRAINING SERVICE] parsed JSON from extracted substring"
          );
        } catch (err2) {
          console.error(
            "[TRAINING SERVICE] parsing extracted substring failed:",
            err2
          );
          parsed = null;
        }
      } else {
        console.warn("[TRAINING SERVICE] no JSON array substring found");
      }
    }

    if (!Array.isArray(parsed)) {
      console.error(
        "[TRAINING SERVICE] parsed result is not array, falling back to DUMMY"
      );
      // [수정됨] LLM 호출 실패 시 DUMMY 반환
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

      if (!options.includes(correctCandidate)) {
        options[0] = correctCandidate;
      }

      // [수정됨] item.question이 없으면 대체 텍스트 사용
      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      const q: QuestionItem = {
        id:
          typeof item?.id === "string" && item.id.trim() !== ""
            ? item.id.trim()
            : nanoid(),
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
        // [수정됨] 패딩 시 고정 텍스트 사용
        padded.push({
          id: nanoid(),
          type: "vocabulary",
          question: `(random word ${i + 1})`,
          options: ["(unknown1)", "(unknown2)", "(unknown3)", "(unknown4)"],
          correct: "(unknown1)",
        });
      }
      console.log(
        "[TRAINING SERVICE] returning padded items count:",
        padded.length
      );
      return padded;
    }

    console.log(
      "[TRAINING SERVICE] returning normalized items count:",
      normalized.length
    );
    return normalized;
  } catch (err) {
    console.error(
      "[TRAINING SERVICE] Error calling LLM for vocabulary questions:",
      err
    );
    // [수정됨] 예외 발생 시 DUMMY 반환
    return DUMMY.vocabulary ?? [];
  }
}
