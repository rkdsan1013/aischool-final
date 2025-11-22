// backend/src/services/aiTalkService.ts
import { aiTalkModel } from "../models/aiTalkModel";
import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";
import {
  generateTalkOpening,
  generateTalkResponse,
} from "../ai/generators/talk";
import { transcribeAudio, generateSpeech } from "../ai/audio";

export const aiTalkService = {
  // ... (CRUD 메서드 생략 - 기존 유지) ...
  getScenarios: async (userId: number) =>
    await aiTalkModel.getScenarios(userId),
  getScenarioById: async (scenarioId: number) =>
    await aiTalkModel.getScenarioById(scenarioId),
  createCustomScenario: async (userId: number, data: any) => {
    const id = await aiTalkModel.createScenario(
      userId,
      data.title,
      data.description,
      data.context
    );
    return { scenario_id: id, ...data };
  },
  updateCustomScenario: async (id: number, uid: number, data: any) =>
    await aiTalkModel.updateScenario(id, uid, data),
  deleteCustomScenario: async (id: number, uid: number) =>
    await aiTalkModel.deleteScenario(id, uid),

  // --- 대화 세션 로직 ---

  // 1. 세션 시작
  startSession: async (userId: number, scenarioId: number, level: string) => {
    const scenario = await aiTalkModel.getScenarioById(scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    const sessionId = await aiTalkModel.createSession(userId, scenarioId);

    let openingText = "";
    try {
      openingText = await generateTalkOpening(scenario.context, level);
    } catch (e) {
      console.error("LLM Opening Error:", e);
      openingText = "Hello! I'm ready to talk.";
    }

    let aiAudio: Buffer | null = null;
    try {
      aiAudio = await generateSpeech(openingText);
    } catch (e) {
      console.error("TTS error:", e);
    }

    const aiMessage = await aiTalkModel.createMessage(
      sessionId,
      "ai",
      openingText
    );

    return {
      session_id: sessionId,
      initial_messages: [aiMessage],
      aiAudio,
    };
  },

  // 2. 메시지 전송 (공통 로직)
  processUserMessage: async (
    sessionId: number,
    userId: number,
    content: string,
    level: string
  ) => {
    const userMsgObj = await aiTalkModel.createMessage(
      sessionId,
      "user",
      content
    );

    const [sessionRows] = await pool.query<RowDataPacket[]>(
      `SELECT sc.context 
       FROM ai_sessions s
       JOIN ai_scenarios sc ON s.scenario_id = sc.scenario_id
       WHERE s.session_id = ?`,
      [sessionId]
    );
    const context = sessionRows[0]?.context || "Daily conversation";

    const allMessages = await aiTalkModel.getMessagesBySession(sessionId);
    const history = allMessages
      .filter((m) => m.message_id !== userMsgObj.message_id)
      .slice(-10)
      .map((m) => ({
        role: m.sender_role,
        content: m.content,
      }));

    let reply = "I heard you.";
    let feedback = null;
    let isFinished = false;

    try {
      // ✅ [수정] is_finished 받아오기
      const llmResult = await generateTalkResponse(
        context,
        history,
        content,
        level
      );
      reply = llmResult.reply;
      feedback = llmResult.feedback;
      isFinished = llmResult.is_finished || false;
    } catch (e) {
      console.error("LLM Response Error:", e);
      reply = "Sorry, I'm having trouble thinking right now.";
    }

    let aiAudio: Buffer | null = null;
    try {
      aiAudio = await generateSpeech(reply);
    } catch (e) {
      console.error("TTS error:", e);
    }

    const aiMsgObj = await aiTalkModel.createMessage(sessionId, "ai", reply);

    if (feedback) {
      await aiTalkModel.createFeedback(userMsgObj.message_id, feedback);
    }

    // ✅ [수정] 대화가 끝났다고 판단되면 세션 종료 처리
    if (isFinished) {
      await aiTalkModel.endSession(sessionId, userId);
    }

    return {
      userMessage: { ...userMsgObj, feedback },
      aiMessage: aiMsgObj,
      aiAudio,
      ended: isFinished, // 컨트롤러에 전달
    };
  },

  // 3. 음성 처리
  processUserAudio: async (
    sessionId: number,
    userId: number,
    audioBuffer: Buffer,
    level: string
  ) => {
    let transcribedText = "";
    try {
      transcribedText = await transcribeAudio(audioBuffer, "webm");
      if (!transcribedText) transcribedText = "(Unintelligible audio)";
    } catch (e) {
      console.error("STT Error:", e);
      throw new Error("Failed to transcribe audio");
    }

    return await aiTalkService.processUserMessage(
      sessionId,
      userId,
      transcribedText,
      level
    );
  },

  endSession: async (sessionId: number, userId: number) => {
    return await aiTalkModel.endSession(sessionId, userId);
  },
};
