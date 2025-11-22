// backend/src/ai/generators/talk.ts
import { generateText, parseJSON } from "../text";

/**
 * 레벨별 프롬프트 가이드 생성 유틸
 */
function getLevelInstruction(level: string = "A1"): string {
  switch (level.toUpperCase()) {
    case "A1":
    case "A2":
      return "The user is a beginner (A1-A2). Use very simple vocabulary, short sentences, and avoid complex grammar. Speak slowly and clearly.";
    case "B1":
    case "B2":
      return "The user is intermediate (B1-B2). Use natural daily conversation skills, moderate vocabulary, and standard grammar. You can use common idioms.";
    case "C1":
    case "C2":
      return "The user is advanced (C1-C2). Use sophisticated vocabulary, nuanced expressions, and complex sentence structures. Speak like a native intellectual.";
    default:
      return "The user is a beginner. Use simple English.";
  }
}

/**
 * 프론트엔드와 동일한 로직으로 단어 인덱스 맵 생성
 */
function createWordIndexMap(text: string): string {
  const parts = text.split(/(\s+)/);
  let wordIndex = 0;
  const map: string[] = [];

  parts.forEach((part) => {
    if (!/\s+/.test(part) && part.trim().length > 0) {
      map.push(`${wordIndex}: "${part}"`);
      wordIndex++;
    }
  });

  return map.join(", ");
}

/**
 * 1. 첫 인사말 생성
 */
export async function generateTalkOpening(
  context: string,
  level: string
): Promise<string> {
  const levelInst = getLevelInstruction(level);

  const systemPrompt = `
    You are a friendly AI conversation partner.
    ${levelInst}
    Output ONLY valid JSON.
  `;

  const userPrompt = `
    Context: "${context}"
    Task: Generate a natural, friendly opening sentence to start the conversation.
    
    Response Format (JSON):
    {
      "opening": "Hello! Welcome to..."
    }
  `;

  const res = await generateText({
    prompt: userPrompt,
    system: systemPrompt,
    temperature: 0.7,
    model: "gpt-4o",
  });

  const parsed = parseJSON<{ opening: string }>(res.text);
  return parsed.opening;
}

/**
 * 2. 대화 응답 + 피드백 생성
 */
export async function generateTalkResponse(
  context: string,
  history: { role: string; content: string }[],
  userMessage: string,
  level: string
): Promise<{ reply: string; feedback: any }> {
  const levelInst = getLevelInstruction(level);

  const historyText = history
    .map((msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");

  const wordIndexMap = createWordIndexMap(userMessage);

  const systemPrompt = `
    You are an AI English tutor and roleplay partner.
    Context: "${context}"
    Target User Level: ${level}
    
    [Instructions]
    1. ${levelInst}
    2. Respond to the user's message naturally in character.
    3. Analyze the user's message for grammar, spelling, and style errors.

    [CRITICAL STYLE FEEDBACK RULES]
    - IF the context is CASUAL: Do NOT flag informal language/slang as errors unless offensive.
    - IF the context is FORMAL: Suggest polite forms.

    [IMPORTANT RULE FOR ERROR INDEXING]
    - For 'grammar' or 'spelling' or 'word' errors: Use [Word Index Map] to find the exact "index".
    - For 'style' errors (tone, politeness, nuance): SET "index" TO null. (Style applies to the whole sentence).
    
    IMPORTANT: Output ONLY valid JSON.
    
    JSON Structure:
    {
      "reply": "Your response here",
      "feedback": {
        "explanation": "Brief explanation in Korean",
        "suggestion": "Corrected natural version",
        "errors": [
          {
            "index": number | null, 
            "word": "error_word",
            "type": "grammar" | "spelling" | "word" | "style",
            "message": "Error description in Korean"
          }
        ]
      }
    }
  `;

  const userPrompt = `
    [Chat History]
    ${historyText}
    
    [Current Message Info]
    Text: "${userMessage}"
    Word Index Map: [ ${wordIndexMap} ]
  `;

  const res = await generateText({
    prompt: userPrompt,
    system: systemPrompt,
    temperature: 0.4,
    model: "gpt-4o",
  });

  return parseJSON<{ reply: string; feedback: any }>(res.text);
}
