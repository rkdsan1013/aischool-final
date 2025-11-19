import { callLLM } from "../llmService";

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
    `당신은 영어 작문 학습용 문제 생성 AI입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    ``,
    `--- [엄격 출력 규칙 — 반드시 준수] ---`,
    `1. 문제 10개를 생성하세요.`,
    `2. 각 문제는 반드시 다음 JSON 객체 형태의 키를 포함해야 합니다:`,
    `   { "korean": "...", "preferred": "...", "canonical_preferred": "...", "alternate": "... or null", "alt_reason": "..." }`,
    `3. 필드 규칙:`,
    `   - korean: 한 줄의 자연스러운 한국어 문장 (학습자가 작문 연습할 문장).`,
    `   - preferred: 한 줄의 자연스러운 영어 문장(정답).`,
    `     * 문장 시작은 대문자로 시작해야 하며, 사람 이름이나 고유명사는 반드시 대문자로 표기하세요.`,
    `     * 마침표는 있어도 되고 없어도 됩니다. 마침표 유무로 오답 처리하지 않습니다.`,
    `   - canonical_preferred: preferred를 정규화한 값으로, 다음 규칙을 적용하세요:`,
    `     1) 모든 문자 소문자화`,
    `     2) 앞뒤 공백 제거`,
    `     3) 연속 공백을 단일 공백으로 축소`,
    `     4) 마침표는 유지 (제거하지 마세요)`,
    `   - alternate: preferred와 실제 회화/글쓰기에서 의미상 교체 가능한 경우에만 하나의 대체 문장을 제공하세요. 그렇지 않으면 null.`,
    `   - alt_reason: alternate가 있을 경우 1~2문장으로 간단한 이유를 작성하세요. alternate가 null이면 빈 문자열("")로 하세요.`,
    `4. 핵심 제약:`,
    `   - answers, options 등의 배열은 절대 출력하지 마세요.`,
    `   - preferred는 반드시 자연스럽고 실제 사용 빈도가 높은 표현이어야 합니다.`,
    `   - alternate는 최대 하나만 제공하며, 의미가 다르면 제공하지 마세요.`,
    `5. 문장 스타일: '수능식·인공적·과도하게 꼬인' 표현을 피하고, 실제 네이티브가 자주 쓰는 표현을 사용하세요.`,
    `6. 수준별 가이드:`,
    `   - A1/A2: 간단한 현재/과거 시제, 기본 어휘 사용.`,
    `   - B1/B2: 다양한 시제와 관용구 허용하되 자연스러움 우선.`,
    `   - C1/C2: 고급 표현 허용하되 네이티브 사용 빈도 우선.`,
    `7. 민감한 주제(정치/성/차별 등)는 피하세요.`,
    `8. 출력은 "오직" JSON 배열 단일 파일로만 하세요. 어떤 설명도 포함하지 마세요.`,
    ``,
    `--- [검증 예시 - 형식만 참고] ---`,
    `{"korean":"그는 피자를 먹었어요","preferred":"He ate a pizza","canonical_preferred":"he ate a pizza","alternate":"He had a pizza","alt_reason":"'ate'는 직접적 서술에 적합하며, 'had'는 상황/경험 묘사에 자연스럽습니다."}`,
    `{"korean":"나는 내일 일찍 출발할 거야","preferred":"I'll leave early tomorrow","canonical_preferred":"i'll leave early tomorrow","alternate":null,"alt_reason":""}`,
  ].join("\n");

  console.log("[WRITING MODEL] Full prompt:\n", prompt);

  const res = await callLLM({
    prompt,
    model: "gpt-5.1",
    maxTokens: 2000,
    temperature: 0.7,
  });

  const rawOutput = String(res.text ?? "");
  console.log("[WRITING MODEL] Full raw output:\n", rawOutput);

  return rawOutput;
}

/**
 * checkWritingAnswer
 * 사용자 입력과 preferred 정답을 비교하여 정답 여부 판단
 */
export async function checkWritingAnswer(
  userInput: string,
  preferred: string
): Promise<{ is_correct: boolean }> {
  const prompt = [
    `다음은 영어 작문 문제의 정답 비교 요청입니다.`,
    `---`,
    `정답 문장: "${preferred}"`,
    `사용자 입력: "${userInput}"`,
    ``,
    `비교 규칙:`,
    `- 오직 preferred와 사용자 입력이 문자 단위로 완전히 일치할 때만 정답입니다.`,
    `- 대소문자, 공백, 마침표 등은 허용되지만 단어가 다르거나 문장 구조가 다르면 오답입니다.`,
    `- 비슷한 표현이나 동의어는 정답으로 처리하지 마세요.`,
    ``,
    `결과는 다음 JSON 형식으로만 출력하세요:`,
    `{ "is_correct": true } 또는 { "is_correct": false }`,
  ].join("\n");

  const res = await callLLM({
    prompt,
    model: "gpt-5.1",
    maxTokens: 100,
    temperature: 0,
  });

  try {
    const parsed = JSON.parse(String(res.text ?? "").trim());
    return typeof parsed?.is_correct === "boolean"
      ? parsed
      : { is_correct: false };
  } catch {
    return { is_correct: false };
  }
}
