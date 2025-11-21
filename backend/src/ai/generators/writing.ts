import { generateText } from "../text";

/**
 * generateWritingQuestionsRaw
 * 'writing' 유형(작문 학습) 문제 10개 생성
 */
export async function generateWritingQuestionsRaw(
  level: string = "C2",
  level_progress: number = 50
): Promise<string> {
  const allowedLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const normalizedLevel = allowedLevels.includes(String(level).toUpperCase())
    ? String(level).toUpperCase()
    : "C2";

  let lp = Number(level_progress);
  if (Number.isNaN(lp) || lp < 0) lp = 0;
  if (lp > 100) lp = 100;

  const prompt = [
    `당신은 영어 작문 문제 출제 AI입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    "",
    `--- [지시] ---`,
    `1. 사용자의 수준(\`${normalizedLevel}\`)에 맞는 작문(영작) 문제 10개를 출제하세요.`,
    `2. 'question'은 작문할 대상이 되는 '자연스러운 한국어 문장'이어야 합니다.`,
    `3. 'correct'는 정답이 될 수 있는 '자연스러운 영어 문장들의 배열'이어야 합니다.`,
    `   - 배열의 첫 번째 항목은 가장 추천하는(preferred) 표현이어야 합니다.`,
    `   - 문맥상 가능한 다른 표현이 있다면 배열에 추가하세요. (없으면 1개만 포함)`,
    `   - 문장은 반드시 대문자로 시작해야 합니다.`,
    `4. **(수준 반영)**`,
    `   - A1/A2: 기본 어휘와 단순한 시제 (I eat apple)`,
    `   - B1/B2: 다양한 시제, 조동사, 접속사 활용`,
    `   - C1/C2: 세련된 관용구, 가정법, 도치 등 고급 문체 사용`,
    `5. 10개의 문제는 서로 주제가 겹치지 않게 다양하게 구성하세요.`,
    `6. 민감한 주제(정치/성/차별 등)는 피하세요.`,
    `7. 오직 JSON 배열 단일 파일로만 출력하세요. (설명 금지)`,
    `8. JSON 구조: {"question": "한국어 문장", "correct": ["English sentence 1", "English sentence 2"]}`,
  ].join("\n");

  console.log("[WRITING GEN] Prompt generated.");

  const res = await generateText({
    prompt,
    model: "gpt-5.1",
    maxTokens: 2000,
    temperature: 0.7,
  });

  return res.text;
}
