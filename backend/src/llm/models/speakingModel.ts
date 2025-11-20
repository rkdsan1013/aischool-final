// backend/src/llm/models/speakingModel.ts
import { callLLM } from "../llmService";
import { openai } from "../client";
import fs from "fs";
import path from "path";
import os from "os";
import { normalizeForCompare } from "../../utils/normalization"; // [추가] 정규화 함수 import

/**
 * 말하기 레벨별 스타일 가이드 (기존 유지)
 */
function getSpeakingStyleRule(level: string): string {
  switch (level) {
    case "A1":
    case "A2":
      return `4. **(핵심 규칙: A1/A2)** 3~6단어의 짧고 명확한 문장을 만드세요. 인사, 자기소개, 날씨, 감정 표현 등 기초적인 회화에 집중하세요.`;
    case "B1":
    case "B2":
      return `4. **(핵심 규칙: B1/B2)** 7~12단어의 자연스러운 구어체 문장을 만드세요. **축약형(I'm, We'll)**을 적극 사용하여 연음 연습이 되도록 하세요.`;
    case "C1":
    case "C2":
    default:
      return `4. **(핵심 규칙: C1/C2)** 10~15단어 내외의 호흡이 긴 문장을 만드세요. 고급 억양과 강세가 요구되는 표현을 사용하세요.`;
  }
}

/**
 * 문제 생성 (기존 유지)
 */
export async function generateSpeakingQuestionsRaw(
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

  const styleRule = getSpeakingStyleRule(normalizedLevel);

  const prompt = [
    `당신은 영어 말하기/발음 교정 전문 AI 코치입니다.`,
    `사용자 CEFR 수준: \`${normalizedLevel}\``,
    "",
    `--- [지시] ---`,
    `1. 사용자의 수준(\`${normalizedLevel}\`)에 맞춰, 따라 읽기(Shadowing) 연습에 적합한 영어 문장 10개를 생성하세요.`,
    `2. **'question' 필드에 사용자가 소리 내어 읽을 '영어 문장'을 넣으세요.**`,
    `3. 문장은 문법적으로 완벽해야 하며, 실제 원어민이 사용하는 자연스러운 표현이어야 합니다.`,
    styleRule,
    `5. 10개의 문장은 서로 주제나 패턴이 중복되지 않게 다양하게 구성하세요.`,
    `6. 민감한 주제는 피하세요.`,
    `7. 오직 JSON 배열 단일 파일로만 출력하세요.`,
    `8. JSON 구조: {"question": "English sentence here..."}`,
  ].join("\n");

  console.log("[SPEAKING MODEL] Full prompt:\n", prompt);

  const res = await callLLM({
    prompt,
    model: "gpt-5.1",
    maxTokens: 2000,
    temperature: 0.7,
  });

  const rawOutput = String(res.text ?? "");
  console.log("[SPEAKING MODEL] Full raw output:\n", rawOutput);

  return rawOutput;
}

/**
 * 최종 검증용 함수 (전체 녹음 파일 처리)
 */
export async function verifySpeakingWithAudio(
  audioBuffer: Buffer,
  targetSentence: string,
  fileExtension: string = "webm"
): Promise<{ isCorrect: boolean; transcript: string; similarity: number }> {
  const tempFilePath = path.join(
    os.tmpdir(),
    `verify_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExtension}`
  );

  try {
    // 1. 파일 저장
    fs.writeFileSync(tempFilePath, audioBuffer);

    // 2. OpenAI Audio API 호출 (whisper-1)
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
    });

    const userTranscript = response.text.trim();

    console.log(`[Speaking] Target: "${targetSentence}"`);
    console.log(`[Speaking] User Said: "${userTranscript}"`);

    // 3. [수정] 정규화 비교 로직 적용
    const normTarget = normalizeForCompare(targetSentence);
    const normUser = normalizeForCompare(userTranscript);

    console.log(`[Speaking Norm] Target: "${normTarget}"`);
    console.log(`[Speaking Norm] User:   "${normUser}"`);

    const isCorrect = normTarget === normUser;

    return {
      isCorrect,
      transcript: userTranscript,
      similarity: isCorrect ? 100 : 0,
    };
  } catch (error) {
    console.error("Audio Verification Error:", error);
    return { isCorrect: false, transcript: "", similarity: 0 };
  } finally {
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch {}
  }
}
