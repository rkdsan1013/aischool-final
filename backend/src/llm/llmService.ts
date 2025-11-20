// backend/src/llm/llmService.ts
import { sendChat } from "./client";

export interface LLMResponse {
  text: string;
  raw?: unknown;
}

/**
 * callLLM: 공통 래퍼
 */
export async function callLLM(params: {
  prompt: string;
  model?: string | undefined;
  maxTokens?: number | undefined;
  temperature?: number | undefined;
  system?: string; // 시스템 프롬프트 오버라이드 허용
}): Promise<LLMResponse> {
  const systemMsg =
    params.system ||
    `You are a helpful assistant. When asked to produce JSON, output only valid JSON with no extra text.`;
  const userMsg = params.prompt;

  try {
    const res = await sendChat({
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      model: params.model,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
    });

    return { text: res.text, raw: res.raw };
  } catch (err) {
    console.error("[LLM SERVICE] callLLM error:", err);
    throw err;
  }
}

/**
 * JSON 파싱 헬퍼 (Markdown 코드블록 제거)
 * -> 다른 모델 파일에서도 쓰기 위해 export 추가
 */
export function parseJSON<T>(text: string): T {
  try {
    // ```json ... ``` 패턴 제거
    const cleaned = text.replace(/```json\s?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    throw new Error("AI response is not valid JSON");
  }
}
