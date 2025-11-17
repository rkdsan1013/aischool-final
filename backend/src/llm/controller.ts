// backend/src/llm/controller.ts
import { Request, Response } from "express";
import { generateVocabularyQuestionsRaw } from "./models/vocabularyModel";
import { nanoid } from "nanoid";

/**
 * 유틸리티
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

  // 중복 제거 및 순서 보존
  const deduped: string[] = Array.from(new Set(rawOptions));

  // correct가 있고 options에 없으면 prepend
  if (correctCandidate !== "" && !deduped.includes(correctCandidate)) {
    deduped.unshift(correctCandidate);
  }

  // 길이 맞추기(4개)
  let options = deduped.slice(0, 4);
  while (options.length < 4) options.push("(unknown)");

  // correct 비어있으면 첫 항목 사용
  if (correctCandidate === "") correctCandidate = options[0]!;

  // 섞어서 정답 위치 편향 완화
  shuffleArray(options);

  // 안전 검사
  if (!options.includes(correctCandidate)) {
    options[0] = correctCandidate;
  }

  return { options, correct: correctCandidate };
}

/**
 * POST /api/llm/vocabulary 핸들러
 * body: { level?: string, level_progress?: number }
 * (words 입력 받지 않음)
 */
export async function vocabularyHandler(req: Request, res: Response) {
  try {
    console.log(
      "[LLM CONTROLLER] /api/llm/vocabulary called with body:",
      req.body
    );

    const body: unknown = req.body ?? {};
    // [수정됨] wordsRaw 및 words 유효성 검사 제거
    const levelRaw = (body as any).level;
    const levelProgressRaw = (body as any).level_progress;

    // 안전한 타입으로 정리: 항상 string / number
    // --- [수정됨] ---
    // 기본값을 "C1"에서 "C2"로 변경
    const level: string = typeof levelRaw === "string" ? levelRaw : "C2";
    // --- [수정 완료] ---
    let level_progress: number =
      typeof levelProgressRaw === "number" ? levelProgressRaw : 50;
    if (Number.isNaN(level_progress) || level_progress < 0) level_progress = 0;
    if (level_progress > 100) level_progress = 100;

    console.log(
      `[LLM CONTROLLER] calling model (random mode)`,
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

    console.log("[LLM CONTROLLER] received raw length:", String(raw).length);
    console.log("[LLM CONTROLLER] raw preview:", String(raw).slice(0, 800));

    // 파싱 시도: 직접 parse -> 실패하면 배열 substring 추출 후 parse
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(String(raw));
      console.log("[LLM CONTROLLER] parsed JSON directly");
    } catch (err) {
      console.warn("[LLM CONTROLLER] direct JSON.parse failed:", err);
      const match = String(raw).match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
          console.log("[LLM CONTROLLER] parsed JSON from extracted substring");
        } catch (err2) {
          console.error(
            "[LLM CONTROLLER] parsing extracted substring failed:",
            err2
          );
          parsed = null;
        }
      } else {
        console.warn(
          "[LLM CONTROLLER] no JSON array substring found in raw output"
        );
      }
    }

    if (!Array.isArray(parsed)) {
      console.error("[LLM CONTROLLER] parsed result not array");
      return res
        .status(502)
        .json({ error: "LLM returned invalid JSON (expected array).", raw });
    }

    const items = (parsed as any[]).slice(0, 10);

    const normalized = items.map((item: any) => {
      const id =
        typeof item?.id === "string" && item.id.trim() !== ""
          ? item.id.trim()
          : nanoid();

      // [수정됨] item.question이 없으면 대체 텍스트 사용
      const question =
        typeof item?.question === "string" && item.question.trim() !== ""
          ? item.question.trim()
          : "(unknown question)";

      const { options, correct } = normalizeOptionsAndCorrect(item);

      const out = {
        id,
        type: "vocabulary" as const,
        question: question,
        options,
        correct,
      };

      // 보장: correct가 options에 없으면 첫 항목으로 설정
      if (!out.options.includes(out.correct)) {
        out.correct = out.options[0]!;
      }

      return out;
    });

    // 패딩: 모델이 10개 미만 반환 시
    if (normalized.length < 10) {
      const padded = normalized.slice();
      for (let i = padded.length; i < 10; i++) {
        // [수정됨] 패딩 시 고정 텍스트 사용
        padded.push({
          id: nanoid(),
          type: "vocabulary" as const,
          question: `(random word ${i + 1})`,
          options: ["(unknown1)", "(unknown2)", "(unknown3)", "(unknown4)"],
          correct: "(unknown1)",
        });
      }
      console.log(
        "[LLM CONTROLLER] returning padded items count:",
        padded.length
      );
      return res.json(padded);
    }

    console.log("[LLM CONTROLLER] returning items count:", normalized.length);
    return res.json(normalized);
  } catch (err) {
    console.error("[LLM CONTROLLER] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}
