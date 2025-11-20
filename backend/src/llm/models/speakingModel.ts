// backend/src/llm/models/speakingModel.ts
import { callLLM } from "../llmService";

/**
 * [신규] 말하기 레벨별 "스타일 및 길이 규칙" 반환
 */
function getSpeakingStyleRule(level: string): string {
  switch (level) {
    // A1/A2: 기초 발음 & 짧은 문장
    case "A1":
    case "A2":
      return `4. **(핵심 규칙: A1/A2)** 3~6단어의 짧고 명확한 문장을 만드세요. 인사, 자기소개, 날씨, 감정 표현 등 기초적인 회화에 집중하세요. (예: "I am so happy today.", "Where is the restroom?")`;

    // B1/B2: 자연스러운 연음 & 리듬 (축약형 필수)
    case "B1":
    case "B2":
      return `4. **(핵심 규칙: B1/B2)** 7~12단어의 자연스러운 구어체 문장을 만드세요. 교과서적인 문장보다는 원어민이 실제 카페나 친구 사이에서 쓰는 표현을 사용하세요. **축약형(I'm, We'll, It's)을 적극 사용**하여 연음(linking) 연습이 되도록 하세요.`;

    // C1/C2: 긴 호흡 & 억양/뉘앙스
    case "C1":
    case "C2":
    default:
      return `4. **(핵심 규칙: C1/C2)** 10~15단어 내외의 호흡이 긴 문장을 만드세요. 비즈니스 미팅, 뉴스 보도, 혹은 깊은 감정 표현 등 **세련된 억양과 강세**가 요구되는 고급 표현을 사용하세요. 관용구(idiom)나 은유적 표현을 포함해도 좋습니다.`;
  }
}

/**
 * generateSpeakingQuestionsRaw
 * 'speaking' 유형(말하기/쉐도잉) 문제 10개 생성
 * 반환: [{"question": "English sentence to speak"}, ...]
 */
export async function generateSpeakingQuestionsRaw(
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

  const styleRule = getSpeakingStyleRule(normalizedLevel);

  const prompt = [
    `당신은 영어 말하기/발음 교정 전문 AI 코치입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    "",
    `--- [지시] ---`,
    `1. 사용자의 수준(\`${normalizedLevel}\`)에 맞춰, 따라 읽기(Shadowing) 연습에 적합한 영어 문장 10개를 생성하세요.`,
    `2. **'question' 필드에 사용자가 소리 내어 읽을 '영어 문장'을 넣으세요.** (한국어 번역이나 해설은 포함하지 마세요.)`,
    `3. 문장은 문법적으로 완벽해야 하며, 실제 원어민이 사용하는 자연스러운 표현이어야 합니다.`,

    // 레벨별 스타일 규칙 삽입
    styleRule,

    `5. 10개의 문장은 서로 주제나 패턴이 중복되지 않게 다양하게 구성하세요. (평서문, 의문문, 감탄문 혼합)`,
    `6. 민감한 주제(정치/성/차별 등)는 피하세요.`,
    `7. 오직 JSON 배열 단일 파일로만 출력하세요. (설명 금지)`,
    `8. JSON 구조: {"question": "English sentence here..."}`,
  ].join("\n");

  console.log("[SPEAKING MODEL] Full prompt:\n", prompt);

  const res = await callLLM({
    prompt,
    model: "gpt-5.1", // 상위 모델
    maxTokens: 2000,
    temperature: 0.7, // 다양한 문장 생성
  });

  const rawOutput = String(res.text ?? "");
  console.log("[SPEAKING MODEL] Full raw output:\n", rawOutput);

  return rawOutput;
}
