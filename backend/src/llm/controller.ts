// backend/src/llm/controller.ts
import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { generateVocabularyQuestionsRaw } from "./models/vocabularyModel";
import { generateSentenceQuestionsRaw } from "./models/sentenceModel";
import { generateBlankQuestionsRaw } from "./models/blankModel";
import { generateWritingQuestionsRaw } from "./models/writingModel";
import { generateSpeakingQuestionsRaw } from "./models/speakingModel"; // [신규]

/**
 * 유틸리티: 배열 셔플
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
 * options 보정: 항상 길이 4의 string[]와 correct:string 리턴
 * (Vocabulary, Blank 유형 전용)
 */
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

/**
 * 공통 LLM 호출 및 파싱 유틸
 */
async function callAndParseLLM(
  generator: (level?: string, level_progress?: number) => Promise<string>,
  level?: string,
  level_progress?: number,
  maxItems = 10
): Promise<unknown[] | { raw: string; error?: Error }> {
  const MAX_RETRIES = 3;
  let parsed: unknown = null;
  let lastError: Error | null = null;
  let raw: string = "";

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      raw = await generator(level, level_progress);

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
          lastError = err as Error;
          parsed = null;
        }
      }

      if (Array.isArray(parsed)) {
        return (parsed as any[]).slice(0, maxItems);
      } else {
        lastError = new Error("Parsed result is not array");
      }
    } catch (llmError) {
      lastError = llmError as Error;
    }
  }

  return { raw, error: lastError ?? new Error("LLM parse failed") };
}

/**
 * POST /api/llm/vocabulary
 */
export async function vocabularyHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "User not authenticated" });

    const level: string | undefined = (user as any).level;
    const level_progress: number | undefined = (user as any).level_progress;

    const parsed = await callAndParseLLM(
      generateVocabularyQuestionsRaw,
      level,
      level_progress
    );
    if (!Array.isArray(parsed)) {
      const { raw, error } = parsed as any;
      console.error("[LLM CONTROLLER][vocabulary] failed:", error);
      return res
        .status(502)
        .json({ error: "LLM returned invalid JSON (expected array).", raw });
    }

    const items = (parsed as any[]).slice(0, 10);
    const normalized = items.map((item: any) => {
      const id = nanoid();
      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      const { options, correct } = normalizeOptionsAndCorrect(item);

      const out = {
        id,
        type: "vocabulary" as const,
        question,
        options,
        correct,
      };

      if (!out.options.includes(out.correct)) {
        out.correct = out.options[0]!;
      }

      return out;
    });

    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: "vocabulary" as const,
          question: `(random word ${i + 1})`,
          options: ["(unknown1)", "(unknown2)", "(unknown3)", "(unknown4)"],
          correct: "(unknown1)",
        });
      }
      return res.json(padded);
    }

    return res.json(normalized);
  } catch (err) {
    console.error("[LLM CONTROLLER][vocabulary] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}

/**
 * POST /api/llm/sentence
 */
export async function sentenceHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "User not authenticated" });

    const level: string | undefined = (user as any).level;
    const level_progress: number | undefined = (user as any).level_progress;

    const parsed = await callAndParseLLM(
      generateSentenceQuestionsRaw,
      level,
      level_progress
    );
    if (!Array.isArray(parsed)) {
      const { raw, error } = parsed as any;
      console.error("[LLM CONTROLLER][sentence] failed:", error);
      return res
        .status(502)
        .json({ error: "LLM returned invalid JSON (expected array).", raw });
    }

    const items = (parsed as any[]).slice(0, 10);
    const normalized = items.map((item: any) => {
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
      const uniq = Array.from(new Set(finalOptions));
      shuffleArray(uniq);

      return {
        id,
        type: "sentence" as const,
        question,
        options: uniq,
        correct: correctWords,
      };
    });

    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: "sentence" as const,
          question: `(random pad ${i + 1})`,
          options: [],
          correct: [],
        });
      }
      return res.json(padded);
    }

    return res.json(normalized);
  } catch (err) {
    console.error("[LLM CONTROLLER][sentence] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}

/**
 * POST /api/llm/blank
 */
export async function blankHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "User not authenticated" });

    const level: string | undefined = (user as any).level;
    const level_progress: number | undefined = (user as any).level_progress;

    const parsed = await callAndParseLLM(
      generateBlankQuestionsRaw,
      level,
      level_progress
    );
    if (!Array.isArray(parsed)) {
      const { raw, error } = parsed as any;
      console.error("[LLM CONTROLLER][blank] failed:", error);
      return res
        .status(502)
        .json({ error: "LLM returned invalid JSON (expected array).", raw });
    }

    const items = (parsed as any[]).slice(0, 10);
    const normalized = items.map((item: any) => {
      const id = nanoid();
      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      const { options, correct } = normalizeOptionsAndCorrect(item);

      const out = {
        id,
        type: "blank" as const,
        question,
        options,
        correct,
      };

      if (!out.options.includes(out.correct)) {
        out.correct = out.options[0]!;
      }

      return out;
    });

    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: "blank" as const,
          question: `(random blank ${i + 1})`,
          options: ["(unknown1)", "(unknown2)", "(unknown3)", "(unknown4)"],
          correct: "(unknown1)",
        });
      }
      return res.json(padded);
    }

    return res.json(normalized);
  } catch (err) {
    console.error("[LLM CONTROLLER][blank] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}

/**
 * POST /api/llm/writing
 * 작문 학습 문제:
 * LLM 반환: { question: "한국어", correct: ["정답1", "정답2"...] }
 */
export async function writingHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "User not authenticated" });

    const level: string | undefined = (user as any).level;
    const level_progress: number | undefined = (user as any).level_progress;

    const parsed = await callAndParseLLM(
      generateWritingQuestionsRaw,
      level,
      level_progress
    );
    if (!Array.isArray(parsed)) {
      const { raw, error } = parsed as any;
      console.error("[LLM CONTROLLER][writing] failed:", error);
      return res
        .status(502)
        .json({ error: "LLM returned invalid JSON (expected array).", raw });
    }

    const items = (parsed as any[]).slice(0, 10);
    const normalized = items.map((item: any) => {
      const id = nanoid();

      // question: 한국어 문장
      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      // correct: 정답 영어 문장 배열 (여러 표현 가능)
      let correctArr: string[] = [];
      if (Array.isArray(item?.correct)) {
        correctArr = item.correct
          .map(String)
          .filter((s: string) => s.trim() !== "");
      } else if (typeof item?.correct === "string") {
        correctArr = [item.correct.trim()];
      }

      if (correctArr.length === 0) {
        correctArr.push("(no correct answer provided)");
      }

      return {
        id,
        type: "writing" as const,
        question,
        options: [], // 작문은 보기가 없음
        correct: correctArr,
      };
    });

    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: "writing" as const,
          question: `(random writing ${i + 1})`,
          options: [],
          correct: ["(unknown)"],
        });
      }
      return res.json(padded);
    }

    return res.json(normalized);
  } catch (err) {
    console.error("[LLM CONTROLLER][writing] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}

/**
 * POST /api/llm/speaking
 * 말하기/쉐도잉 문제: LLM은 { question: "English Sentence" } 형태 반환
 */
export async function speakingHandler(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "User not authenticated" });

    const level: string | undefined = (user as any).level;
    const level_progress: number | undefined = (user as any).level_progress;

    const parsed = await callAndParseLLM(
      generateSpeakingQuestionsRaw,
      level,
      level_progress
    );

    if (!Array.isArray(parsed)) {
      const { raw, error } = parsed as any;
      console.error("[LLM CONTROLLER][speaking] failed:", error);
      return res
        .status(502)
        .json({ error: "LLM returned invalid JSON (expected array).", raw });
    }

    const items = (parsed as any[]).slice(0, 10);
    const normalized = items.map((item: any) => {
      const id = nanoid();
      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      return {
        id,
        type: "speaking" as const,
        question, // 따라 읽을 영어 문장
        options: [], // 보기 없음
        correct: question, // 정답(원문)
      };
    });

    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        padded.push({
          id: nanoid(),
          type: "speaking" as const,
          question: `(random speaking ${i + 1})`,
          options: [],
          correct: `(random speaking ${i + 1})`,
        });
      }
      return res.json(padded);
    }

    return res.json(normalized);
  } catch (err) {
    console.error("[LLM CONTROLLER][speaking] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}
