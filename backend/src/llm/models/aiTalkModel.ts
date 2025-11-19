// backend/src/llm/models/aiTalkModel.ts
import { callLLM, parseJSON } from "../llmService";

export const aiTalkLLM = {
  /**
   * 1. 첫 인사말 생성
   */
  async generateOpening(context: string): Promise<string> {
    const prompt = `
      Context: "${context}"
      Task: Generate a natural, friendly opening sentence to start the conversation based on the context above.
      Language: English.
      Limit: 1-2 sentences.
    `;

    const res = await callLLM({
      prompt,
      temperature: 0.7,
    });

    return res.text.replace(/"/g, ""); // 따옴표 제거
  },

  /**
   * 2. 대화 응답 + 피드백 생성
   */
  async generateResponseAndFeedback(
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

    const res = await callLLM({
      prompt: userPrompt,
      system: systemPrompt, // 시스템 프롬프트 교체
      temperature: 0.4, // 피드백 정확도를 위해 온도를 낮춤
    });

    return parseJSON(res.text);
  },
};
