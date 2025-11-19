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
  writing: [
    {
      id: "w1",
      type: "writing",
      question: "그는 피자를 먹었어요",
      correct: "He ate a pizza",
    },
  ],
  speaking: [],
};

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

  shuffleArray(options);

  if (!options.includes(correctCandidate)) {
    options[0] = correctCandidate;
  }

  return { options, correct: correctCandidate };
}

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
          const match = String(raw).match(/\[[\s\S]*\]/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (err2) {
              lastError = err2 as Error;
              parsed = null;
            }
          } else {
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
    let normalized: QuestionItem[];

    if (type === "vocabulary" || type === "blank") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question =
          typeof item?.question === "string" && item.question.trim() !== ""
            ? item.question.trim()
            : "(unknown question)";
        const { options, correct } = normalizeOptionsAndCorrect(item);
        return { id, type, question, options, correct };
      });
    } else if (type === "sentence") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const question =
          typeof item?.question === "string" && item.question.trim() !== ""
            ? item.question.trim()
            : "(unknown question)";
        const correctWords: string[] = Array.isArray(item?.correct)
          ? item.correct.map(String).filter((s: string) => s !== "")
          : [];
        const distractorWords: string[] = Array.isArray(item?.options)
          ? item.options.map(String).filter((s: string) => s !== "")
          : [];
        const finalOptions = [...correctWords, ...distractorWords];
        shuffleArray(finalOptions);
        return {
          id,
          type: "sentence",
          question,
          options: finalOptions,
          correct: correctWords,
        };
      });
    } else if (type === "writing") {
      normalized = items.map((item: any) => {
        const id = nanoid();
        const korean =
          typeof item?.korean === "string" && item.korean.trim() !== ""
            ? item.korean.trim()
            : "(unknown korean)";
        const preferred: string =
          typeof item?.preferred === "string" && item.preferred.trim() !== ""
            ? item.preferred.trim()
            : "(unknown preferred)";
        return { id, type: "writing", question: korean, correct: preferred };
      });
    } else {
      return DUMMY[type] ?? [];
    }

    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        const isSentence = type === "sentence";
        const isWriting = type === "writing";
        padded.push({
          id: nanoid(),
          type,
          question: `(random pad ${i + 1})`,
          options: isSentence
            ? []
            : isWriting
            ? undefined
            : ["(pad1)", "(pad2)", "(pad3)", "(pad4)"],
          correct: isSentence
            ? []
            : isWriting
            ? "(unknown preferred)"
            : "(pad1)",
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
