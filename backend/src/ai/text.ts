// backend/src/ai/text.ts
import { sendChat } from "./client";

export interface TextGenResponse {
  text: string;
  raw?: unknown;
}

/**
 * 텍스트 생성 공통 함수 (구 callLLM)
 */
export async function generateText(params: {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}): Promise<TextGenResponse> {
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
    console.error("[AI Text] Generation error:", err);
    throw err;
  }
}

/**
 * JSON 파싱 헬퍼
 */
export function parseJSON<T>(text: string): T {
  try {
    const cleaned = text.replace(/```json\s?|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error. Input text:", text);
    throw new Error("AI response is not valid JSON");
  }
}
