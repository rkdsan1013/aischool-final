// backend/src/ai/generators/writing.ts
import { generateText } from "../text";

/**
 * generateWritingQuestionsRaw
 * 'writing' 유형(작문 학습) 문제 10개 생성
 * 수정사항: correct를 배열이 아닌 '단일 문장'으로 생성하여 의도한 정답을 명확히 함.
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
    `2. 'question': 번역할 자연스러운 **한국어 문장**`,
    `3. 'correct': 해당 한국어 문장을 가장 완벽하게 번역한 **단 하나의 영어 문장** (문자열)`,
    `   - 문맥상 가장 적절하고 자연스러운 표현 하나만 제시하세요.`,
    `   - 문장은 반드시 대문자로 시작하고 마침표로 끝나야 합니다.`,
    `4. **(수준 반영)**`,
    `   - A1/A2: 기본 어휘와 단순한 시제 (I eat apple.)`,
    `   - B1/B2: 다양한 시제, 조동사, 접속사 활용`,
    `   - C1/C2: 세련된 관용구, 가정법, 도치 등 고급 문체 사용`,
    `5. 10개의 문제는 서로 주제가 겹치지 않게 다양하게 구성하세요.`,
    `6. 민감한 주제(정치/성/차별 등)는 피하세요.`,
    `7. 오직 JSON 배열 단일 파일로만 출력하세요. (마크다운 코드블록 없이 Raw JSON)`,
    `8. JSON 구조: [{"question": "한국어 문장", "correct": "Single English sentence."}]`,
  ].join("\n");

  console.log("[WRITING GEN] Prompt generated.");

  const res = await generateText({
    prompt,
    model: "gpt-4o", // 고품질 생성을 위해 고성능 모델 사용 권장
    maxTokens: 2500,
    temperature: 0.7,
  });

  return res.text;
}

/**
 * verifyWritingWithLLM
 * 작문 정답 검증을 위한 LLM 호출
 * 입력: 한국어 질문, 의도한 정답(영어), 사용자 답변(영어)
 * 출력: 정답 여부 및 피드백
 */
export async function verifyWritingWithLLM(
  question: string,
  intendedAnswer: string,
  userAnswer: string
): Promise<{ isCorrect: boolean; feedback: string }> {
  // 빠른 응답을 위해 gpt-4o-mini 혹은 gpt-3.5-turbo 등 경량 모델 사용 권장
  const prompt = [
    `Role: English Language Teacher`,
    `Task: Evaluate if the user's English translation is correct based on the Korean source sentence.`,
    `---`,
    `[Source Sentence (KR)]: "${question}"`,
    `[Intended Answer (EN)]: "${intendedAnswer}"`,
    `[User Answer (EN)]: "${userAnswer}"`,
    `---`,
    `Criteria:`,
    `1. Meaning: Does the User Answer convey the same meaning as the Source Sentence?`,
    `2. Grammar: Is the User Answer grammatically correct?`,
    `3. Nuance: Minor stylistic differences are okay if the meaning is accurate.`,
    `4. Typos: Ignore minor punctuation or capitalization errors.`,
    `5. Output: Return valid JSON only.`,
    `Format: { "isCorrect": boolean, "reasoning": "short explanation" }`,
  ].join("\n");

  try {
    const res = await generateText({
      prompt,
      model: "gpt-4o-mini", // 빠른 모델 사용
      maxTokens: 300,
      temperature: 0.0, // 일관성을 위해 0
    });

    // JSON 파싱 (가끔 마크다운이 섞일 수 있으므로 처리)
    const jsonMatch = res.text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : "{}";

    const parsed = JSON.parse(jsonStr);

    return {
      isCorrect: !!parsed.isCorrect,
      feedback: parsed.reasoning || "",
    };
  } catch (e) {
    console.error("[Verify Writing] LLM Error:", e);
    // LLM 실패 시 Fallback: 단순 정규화 비교
    const normUser = userAnswer.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normIntended = intendedAnswer.toLowerCase().replace(/[^a-z0-9]/g, "");

    return {
      isCorrect: normUser === normIntended,
      feedback: "System fallback verification used.",
    };
  }
}
