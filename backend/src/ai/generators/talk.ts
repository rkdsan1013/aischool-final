/* cspell:disable */
import { generateText, parseJSON } from "../text";

/**
 * 1. 첫 인사말 생성
 */
export async function generateTalkOpening(context: string): Promise<string> {
  const prompt = `
    Context: "${context}"
    Task: Generate a natural, friendly opening sentence to start the conversation based on the context above.
    Language: English.
    Limit: 1-2 sentences.
  `;

  const res = await generateText({
    prompt,
    temperature: 0.7,
    model: "gpt-4o",
  });

  return res.text.replace(/"/g, ""); // 따옴표 제거
}

/**
 * 2. 대화 응답 + 피드백 생성
 */
export async function generateTalkResponse(
  context: string,
  userMessage: string
): Promise<{ reply: string; feedback: any }> {
  const systemPrompt = `
    You are an AI English tutor and roleplay partner.
    Context: "${context}"
    
    Your task is to:
    1. Respond to the user's message naturally in character (English).
    2. Analyze the user's message for grammar, spelling, and style errors.
    
    Output ONLY valid JSON in this format:
    {
      "reply": "Your response here",
      "feedback": {
        "explanation": "Brief explanation in Korean(한국어) about the user's sentence",
        "suggestion": "Corrected natural version of user's sentence",
        "errors": [
          {
            "index": number (word index starting at 0, or null for style issues),
            "word": "error_word",
            "type": "grammar" | "spelling" | "word" | "style",
            "message": "Error description in Korean"
          }
        ]
      }
    }
  `;

  const userPrompt = `User said: "${userMessage}"`;

  const res = await generateText({
    prompt: userPrompt,
    system: systemPrompt,
    temperature: 0.4,
    model: "gpt-4o",
    // jsonMode: true,  <-- [제거됨] 타입 에러 해결
  });

  return parseJSON(res.text);
}
