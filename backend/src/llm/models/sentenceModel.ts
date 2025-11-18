// backend/src/llm/models/sentenceModel.ts
import { callLLM } from "../llmService";

/**
 * [수정됨] 문장 길이 제한 + '예시'를 '추상적인 설명'으로 변경
 */
function getSentenceComplexityRule(level: string): string {
  switch (level) {
    // A1/A2: 3-6 단어, 단순 구조
    case "A1":
    case "A2":
      return `4. **(핵심 규칙: A1/A2)** \`correct\` 배열의 길이는 **3~6개**여야 합니다. (간단한 주어-동사-목적어 구조)`;

    // B1: 5-8 단어, 아이디어 연결
    case "B1":
      return `4. **(핵심 규칙: B1)** \`correct\` 배열의 길이는 **5~8개**여야 합니다. (접속사나 부사구를 활용해 두 아이디어를 연결하는 문장)`;

    // B2: 6-10 단어, 상세 수식
    case "B2":
      return `4. **(핵심 규칙: B2)** \`correct\` 배열의 길이는 **6~10개**여야 합니다. (관계대명사 절이나 다양한 시제를 활용하여 아이디어를 상세히 설명하는 문장)`;

    // C1/C2: 8-12 단어, 복잡/추상적 구조
    case "C1":
    case "C2":
    default:
      return `4. **(핵심 규칙: C1/C2)** \`correct\` 배열의 길이는 **반드시 8개에서 12개 사이**여야 합니다. (이 길이 제한을 절대 초과하지 마세요.)
5. 이 길이 제한 안에서, 고급 문법 구조, 추상적 개념, 또는 관용적 표현을 포함한 **복잡한 문장**을 생성해야 합니다.`;
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

    `6. **(핵심 규칙: 오답)** 'options' 배열에는 'correct' 배열에 포함되지 않는 **2~3개의 '오답(distractor)' 단어만** 포함해야 합니다.`,
    `7. 이 '오답' 단어들은 문법적으로 헷갈리거나(예: 'go' vs 'goes', 'am' vs 'is') 문맥상 그럴듯해 보여야 합니다.`,
    `8. **(다양성 규칙)** 10개의 문제는 서로 중복되지 않아야 하며, 다양한 문법 구조(평서문, 의문문 등)를 골고루 선정해야 합니다.`,
    `9. **(무작위성 규칙)** 매번 요청 시마다, 가장 흔하고 예측 가능한 문장으로 시작하지 말고, 창의적이고 무작위적인 새로운 문장 조합을 생성하세요.`,
    `10. 오직 JSON 배열 단일 파일로만 출력하세요. (설명 금지)`,
    `11. JSON 구조: {"question": "...", "options": ["오답1", "오답2"], "correct": ["정답1", "정답2", "..."]}`,
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
