// backend/src/llm/models/sentenceModel.ts
import { callLLM } from "../llmService";

/**
 * [신규] 문장 레벨별 "복잡도 규칙"을 반환하는 헬퍼 함수
 */
function getSentenceComplexityRule(level: string): string {
  switch (level) {
    // A1/A2: 3-5 단어의 간단한 문장 (SVO)
    case "A1":
    case "A2":
      return `4. **(핵심 규칙: A1/A2)** 3~5개의 단어 블록으로 구성된 간단한 문장을 출제하세요. (예: 주어 + 동사 + 목적어)`;

    // B1: 5-7 단어, 접속사 또는 간단한 절
    case "B1":
      return `4. **(핵심 규칙: B1)** 5~7개의 단어 블록으로 구성된 문장을 출제하세요. (예: 접속사 'and', 'but' 또는 간단한 시간/장소 부사구 포함)`;

    // B2: 6-9 단어, 관계대명사 절 또는 다양한 시제
    case "B2":
      return `4. **(핵심 규칙: B2)** 6~9개의 단어 블록으로 구성된 문장을 출제하세요. (예: 'who', 'which'를 사용한 관계대명사 절 또는 다양한 시제 혼합)`;

    // C1/C2: 7-10+ 단어, 복잡한 문법 구조 또는 관용구
    case "C1":
    case "C2":
    default:
      return `4. **(핵심 규칙: C1/C2)** 7개 이상의 단어 블록으로 구성된 복잡한 문장을 출제하세요. (예: 고급 문법, 관용적 표현, 또는 추상적 개념 포함)`;
  }
}

/**
 * generateSentenceQuestionsRaw
 * 'sentence' 유형의 문제를 생성 (문장 순서 맞추기)
 */
export async function generateSentenceQuestionsRaw(
  level: string = "C2",
  level_progress: number = 50 // 파라미터는 받지만, 프롬프트에서 의도적으로 무시
): Promise<string> {
  const allowedLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const normalizedLevel = allowedLevels.includes(String(level).toUpperCase())
    ? String(level).toUpperCase()
    : "C2";

  let lp = Number(level_progress);
  if (Number.isNaN(lp) || lp < 0) lp = 0;
  if (lp > 100) lp = 100;

  // 레벨에 맞는 오답 규칙을 동적으로 생성
  const complexityRule = getSentenceComplexityRule(normalizedLevel);

  const prompt = [
    `당신은 영어 문장 구성 문제 출제 AI입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    "",
    `--- [지시] ---`,
    `1. 사용자의 수준(\`${normalizedLevel}\`)에 맞는 문장 순서 맞추기 문제 10개를 출제하세요.`,
    `2. 'question'은 힌트가 될 '단일 한국어 번역 문장'이어야 합니다.`,
    `3. 'correct'는 'question'을 번역한 '올바른 순서의 영어 단어 배열'이어야 합니다.`,

    // 동적으로 생성된 복잡도 규칙 삽입
    complexityRule,

    `5. **(핵심 규칙: Scramble)** 'options'는 'correct' 배열의 항목들을 **무작위로 섞은(scrambled)** 배열이어야 합니다. ('options'와 'correct'는 동일한 항목들을 가져야 합니다.)`,
    `6. **(다양성 규칙)** 10개의 문제는 서로 중복되지 않아야 하며, 다양한 문법 구조(평서문, 의문문 등)를 골고루 선정해야 합니다.`,
    `7. **(무작위성 규칙)** 매번 요청 시마다, 가장 흔하고 예측 가능한 문장으로 시작하지 말고, 창의적이고 무작위적인 새로운 문장 조합을 생성하세요.`,
    `8. 오직 JSON 배열 단일 파일로만 출력하세요. (설명 금지)`,
    `9. JSON 구조: {"question": "...", "options": ["...", "..."], "correct": ["...", "..."]}`,
  ].join("\n");

  console.log("[SENTENCE MODEL] Full prompt:\n", prompt);

  const res = await callLLM({
    prompt,
    model: "gpt-5.1", // 상위 모델
    maxTokens: 2000,
    temperature: 0.7, // 다양한 문제 생성
  });

  const rawOutput = String(res.text ?? "");
  console.log("[SENTENCE MODEL] Full raw output:\n", rawOutput);

  return rawOutput;
}
