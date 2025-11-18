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
  // --- [수정됨] ---
  const MAX_RETRIES = 3;
  let parsed: unknown = null;
  let lastError: Error | null = null;
  let raw: string = "";
  // --- [수정 완료] ---

  try {
    const body: unknown = req.body ?? {};
    const levelRaw = (body as any).level;
    const levelProgressRaw = (body as any).level_progress;

    const level: string | undefined =
      typeof levelRaw === "string" ? levelRaw : undefined;
    const level_progress: number | undefined =
      typeof levelProgressRaw === "number" ? levelProgressRaw : undefined;

    // --- [수정됨] 재시도 루프 추가 ---
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        raw = await generateVocabularyQuestionsRaw(level, level_progress);

        // 1. 파싱 시도 (직접)
        try {
          parsed = JSON.parse(String(raw));
        } catch (err) {
          console.warn(
            `[LLM CONTROLLER] Attempt ${attempt}/${MAX_RETRIES}: direct JSON.parse failed:`,
            err
          );
          // 2. 파싱 시도 (서브스트링 추출)
          const match = String(raw).match(/\[[\s\S]*\]/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (err2) {
              console.error(
                `[LLM CONTROLLER] Attempt ${attempt}/${MAX_RETRIES}: parsing extracted substring failed:`,
                err2
              );
              lastError = err2 as Error;
              parsed = null; // 실패
            }
          } else {
            console.warn(
              `[LLM CONTROLLER] Attempt ${attempt}/${MAX_RETRIES}: no JSON array substring found`
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
          `[LLM CONTROLLER] Attempt ${attempt}/${MAX_RETRIES}: LLM call failed:`,
          llmError
        );
        lastError = llmError as Error;
      }
      // 재시도 전 잠시 대기 (선택 사항)
      // await new Promise(resolve => setTimeout(resolve, 500));
    }
    // --- [수정 완료] ---

    if (!Array.isArray(parsed)) {
      console.error(
        `[LLM CONTROLLER] All ${MAX_RETRIES} attempts failed. Last error:`,
        lastError
      );
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

      if (!out.options.includes(out.correct)) {
        out.correct = out.options[0]!;
      }

      return out;
    });

    // 패딩: 모델이 10개 미만 반환 시
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
    console.error("[LLM CONTROLLER] unexpected error:", err);
    return res.status(500).json({ error: "LLM generation failed" });
  }
}
