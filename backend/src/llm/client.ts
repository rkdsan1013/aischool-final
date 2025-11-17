// backend/src/llm/client.ts
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY가 설정되어 있지 않습니다. LLM 호출은 실패할 수 있습니다."
  );
}

export const openai = new OpenAI({ apiKey });

export async function sendChat(options: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string | undefined;
  maxTokens?: number | undefined;
  temperature?: number | undefined;
}): Promise<{ text: string; raw: unknown }> {
  const {
    messages,
    model = "gpt-4o-mini", // 이 기본값은 vocabularyModel에서 덮어쓰므로 괜찮습니다.
    maxTokens = 800,
    temperature = 0.2,
  } = options;

  try {
    console.log("[LLM CLIENT] sending chat request:", {
      model,
      maxTokens,
      temperature,
      messagesLength: messages.length,
    });

    // openai SDK 호출
    const resp = await (openai as any).chat.completions.create({
      model,
      messages,
      // --- [수정됨] ---
      // gpt-5.1 모델의 API 규격에 맞춰 파라미터 이름 변경
      max_completion_tokens: maxTokens,
      // max_tokens: maxTokens, // <-- 이전 코드
      // --- [수정 완료] ---
      temperature,
    });

    const choices = (resp as any)?.choices;
    const text =
      Array.isArray(choices) && choices.length > 0
        ? String(choices[0]?.message?.content ?? "")
        : "";

    console.log("[LLM CLIENT] received response text length:", text.length);
    console.log("[LLM CLIENT] response preview:", text.slice(0, 500));
    return { text, raw: resp };
  } catch (err) {
    console.error("[LLM CLIENT] error while calling OpenAI:", err);
    throw err;
  }
}
