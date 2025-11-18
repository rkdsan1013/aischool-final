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
}): Promise<LLMResponse> {
  const system = `You are a helpful assistant. When asked to produce JSON, output only valid JSON with no extra text.`;
  const user = params.prompt;

  try {
    const res = await sendChat({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
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
