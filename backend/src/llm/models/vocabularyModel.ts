// backend/src/llm/models/vocabularyModel.ts
import { callLLM } from "../llmService";

// [삭제됨] 모든 헬퍼 함수

/**
 * generateVocabularyQuestionsRaw
 * gpt-5.1+ 등급의 상위 모델에 최적화된 프롬프트 사용
 */
export async function generateVocabularyQuestionsRaw(
  // --- [수정됨] ---
  // 기본값을 "C1"에서 "C2"로 변경
  level: string = "C2",
  // --- [수정 완료] ---
  level_progress: number = 50 // 파라미터는 받지만, 프롬프트에서 의도적으로 무시
): Promise<string> {
  const allowedLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const normalizedLevel = allowedLevels.includes(String(level).toUpperCase())
    ? String(level).toUpperCase()
    : "C2"; // <-- 만약의 경우를 대비해 fallback도 "C2"로 변경

  // level_progress은 0..100 범위로 정리 (콘솔 로그용)
  let lp = Number(level_progress);
  if (Number.isNaN(lp) || lp < 0) lp = 0;
  if (lp > 100) lp = 100;

  // [수정됨] Copilot(thinkdeeper)와 유사한, 상위 모델용 초간결 프롬프트
  const prompt = [
    `당신은 영어 문제 출제 AI입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    "",
    `--- [지시] ---`,
    `1. 사용자의 수준(\`${normalizedLevel}\`)에 맞는 단어 문제 10개를 출제하세요.`,
    `2. 'question'은 번역할 '단일 한국어 단어'여야 합니다. (문장 X)`,
    `3. 'options'는 4개의 영어 단어여야 합니다.`,

    // --- [수정됨] ---
    // 모호한 문제(정답이 여러 개) 생성을 방지하기 위해 규칙을 명확화
    `4. **(핵심 규칙)** 4개의 'options' 중 **오직 하나만**이 'question'의 정확한 번역이어야 합니다.`,
    `5. 나머지 3개의 오답은, 정답과 철자/발음이 비슷하거나(예: alleviation vs allocation) 의미가 헷갈릴 순 있지만, 'question'의 번역으로는 **명백히 틀린(incorrect)** 단어여야 합니다.`,
    // --- [수정 완료] ---

    `6. 10개의 문제는 서로 중복되지 않아야 합니다.`,
    `7. 오직 JSON 배열 단일 파일로만 출력하세요. (설명 금지)`,
    `8. JSON 구조: {"id": "v1", "type": "vocabulary", "question": "...", "options": ["...", "...", "...", "..."], "correct": "..."}`,
  ].join("\n");

  console.log("[VOCAB MODEL] generateVocabularyQuestionsRaw called");
  console.log(
    `[VOCAB MODEL] Mode: RANDOM (Optimized for gpt-5.1, Fast)`,
    "Level:",
    normalizedLevel
  );
  console.log(
    "[VOCAB MODEL] prompt preview:",
    prompt.split("\n").slice(0, 4).join(" | ")
  );

  const res = await callLLM({
    prompt,
    model: "gpt-5.1", // 상위 모델
    maxTokens: 2000,
    temperature: 0.7, // 다양한 문제 생성
  });

  console.log(
    "[VOCAB MODEL] raw LLM output length:",
    String(res.text ?? "").length
  );
  console.log(
    "[VOCAB MODEL] raw output preview:",
    String(res.text ?? "").slice(0, 800)
  );

  return String(res.text ?? "");
}
