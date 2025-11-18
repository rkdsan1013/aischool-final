// backend/src/llm/models/vocabularyModel.ts
import { callLLM } from "../llmService";

/**
 * [수정됨] CEFR 레벨별 오답 생성 규칙 (예시 단어/범주 제거)
 */
function getDistractorRule(level: string): string {
  switch (level) {
    // A1/A2: 무작위 오답 (Random)
    case "A1":
    case "A2":
      return `4. **(핵심 규칙: A1/A2)** 4개의 'options' 중 **오직 하나만**이 'question'의 정확한 번역이어야 합니다.
5. 나머지 3개의 오답은, 정답과 **의미적으로 전혀 관련이 없는** \`${level}\` 수준의 다른 **무작위 기초 단어**여야 합니다. (즉, '의미 범주'로 묶지 마세요)`;

    // B1: 철자/발음 혼동 오답
    case "B1":
      return `4. **(핵심 규칙: B1)** 4개의 'options' 중 **오직 하나만**이 'question'의 정확한 번역이어야 합니다.
5. 나머지 3개의 오답은, 'question'의 번역으로는 **명백히 틀리지만(incorrect)**, 정답과 **철자 또는 발음이 비슷하여** 헷갈리기 쉬운 \`${level}\` 수준의 단어여야 합니다.`;

    // B2: 의미 범주 혼동 오답
    case "B2":
      return `4. **(핵심 규칙: B2)** 4개의 'options' 중 **오직 하나만**이 'question'의 정확한 번역이어야 합니다.
5. 나머지 3개의 오답은, 'question'의 번역으로는 **명백히 틀리지만**, 정답과 **유사한 의미 범주(semantic category)**에 속하여 헷갈릴 수 있는 \`${level}\` 수준의 단어여야 합니다. (단, 유의어를 나열하여 정답이 모호해지는 것을 금지합니다.)`;

    // C1/C2: 복합 (철자 + 뉘앙스) 오답
    case "C1":
    case "C2":
    default:
      return `4. **(핵심 규칙: C1/C2)** 4개의 'options' 중 **오직 하나만**이 'question'의 정확한 번역이어야 합니다.
5. 나머지 3개의 오답은, 'question'의 번역으로는 **명백히 틀리지만**, (A) 정답과 철자/발음이 비슷하거나 (B) 정답과 미묘한 뉘앙스 차이가 있는 유의어/반의어 등, \`${level}\` 수준에서 헷갈릴 수 있는 단어들로 **정교하게 복합 구성**하세요. (정답이 될 수 있는 유의어를 오답에 포함하지 마세요.)`;
  }
}

/**
 * generateVocabularyQuestionsRaw
 * gpt-5.1+ 등급의 상위 모델에 최적화된 프롬프트 사용
 */
export async function generateVocabularyQuestionsRaw(
  level: string = "C2",
  level_progress: number = 50 // 파라미터는 받지만, 프롬프트에서 의도적으로 무시
): Promise<string> {
  const allowedLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  // 상위 파일에서 undefined를 보낼 경우를 대비해 기본값/폴백 모두 "C2"로 설정
  const normalizedLevel = allowedLevels.includes(String(level).toUpperCase())
    ? String(level).toUpperCase()
    : "C2";

  let lp = Number(level_progress);
  if (Number.isNaN(lp) || lp < 0) lp = 0;
  if (lp > 100) lp = 100;

  // 레벨에 맞는 오답 규칙을 동적으로 생성
  const distractorRule = getDistractorRule(normalizedLevel);

  const prompt = [
    `당신은 영어 문제 출제 AI입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    "",
    `--- [지시] ---`,
    `1. 사용자의 수준(\`${normalizedLevel}\`)에 맞는 단어 문제 10개를 출제하세요.`,
    `2. 'question'은 번역할 '단일 한국어 단어'여야 합니다. (문장 X)`,
    `3: 'options'는 4개의 영어 단어여야 합니다.`,

    // 동적으로 생성된 규칙 삽입
    distractorRule,

    `6. **(다양성 규칙)** 10개의 'question' 단어는 서로 중복되지 않아야 하며, 다양한 주제(명사, 동사, 형용사 등)에서 골고루 선정해야 합니다.`,
    `7. **(무작위성 규칙)** 매번 요청 시마다, 가장 흔하고 예측 가능한 단어로 시작하지 말고, 창의적이고 무작위적인 새로운 단어 조합을 생성하세요.`,
    `8. 오직 JSON 배열 단일 파일로만 출력하세요. (설명 금지)`,
    `9. JSON 구조: {"question": "...", "options": ["...", "...", "...", "..."], "correct": "..."}`,
  ].join("\n");

  // [수정됨] 로그 제거
  // console.log("[VOCAB MODEL] Full prompt:\n", prompt);

  const res = await callLLM({
    prompt,
    model: "gpt-5.1", // 상위 모델
    maxTokens: 2000,
    temperature: 0.7, // 다양한 문제 생성
  });

  const rawOutput = String(res.text ?? "");

  // [수정됨] 로그 제거
  // console.log("[VOCAB MODEL] Full raw output:\n", rawOutput);

  return rawOutput;
}
