// backend/src/services/aiTalkService.ts
import { aiTalkModel } from "../models/aiTalkModel";
import { pool } from "../config/db";
import { RowDataPacket } from "mysql2";
import {
  generateTalkOpening,
  generateTalkResponse,
} from "../ai/generators/talk";
import { transcribeAudio, generateSpeech } from "../ai/audio"; // ✅ 오디오 모듈 import

export const aiTalkService = {
  // --- 시나리오 CRUD ---
  getScenarios: async (userId: number) => {
    return await aiTalkModel.getScenarios(userId);
  },

  getScenarioById: async (scenarioId: number) => {
    return await aiTalkModel.getScenarioById(scenarioId);
  },

  createCustomScenario: async (
    userId: number,
    data: { title: string; description: string; context: string }
  ) => {
    const id = await aiTalkModel.createScenario(
      userId,
      data.title,
      data.description,
      data.context
    );
    return { scenario_id: id, ...data };
  },

  updateCustomScenario: async (
    scenarioId: number,
    userId: number,
    data: any
  ) => {
    return await aiTalkModel.updateScenario(scenarioId, userId, data);
  },

  deleteCustomScenario: async (scenarioId: number, userId: number) => {
    return await aiTalkModel.deleteScenario(scenarioId, userId);
  },

  // --- 대화 세션 로직 ---

  // 1. 세션 시작
  startSession: async (userId: number, scenarioId: number, level: string) => {
    const scenario = await aiTalkModel.getScenarioById(scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    const sessionId = await aiTalkModel.createSession(userId, scenarioId);

    // AI 첫 마디 생성 (텍스트)
    let openingText = "";
    try {
      openingText = await generateTalkOpening(scenario.context, level);
    } catch (e) {
      console.error("LLM Opening Error:", e);
      openingText = "Hello! I'm ready to talk.";
    }

    // ✅ AI 첫 마디 음성 생성 (TTS)
    let aiAudio: Buffer | null = null;
    try {
      aiAudio = await generateSpeech(openingText);
    } catch (e) {
      console.error("TTS generation failed for opening:", e);
    }

    const aiMessage = await aiTalkModel.createMessage(
      sessionId,
      "ai",
      openingText
    );

    return {
      session_id: sessionId,
      initial_messages: [aiMessage],
      aiAudio, // ✅ 컨트롤러로 오디오 버퍼 전달
    };
  },

  // 2. 메시지 전송 (텍스트 입력 -> AI 응답 텍스트/음성)
  processUserMessage: async (
    sessionId: number,
    userId: number,
    content: string,
    level: string
  ) => {
    // 1) 유저 메시지 저장
    const userMsgObj = await aiTalkModel.createMessage(
      sessionId,
      "user",
      content
    );

    // 2) 컨텍스트 조회
    const [sessionRows] = await pool.query<RowDataPacket[]>(
      `SELECT sc.context 
       FROM ai_sessions s
       JOIN ai_scenarios sc ON s.scenario_id = sc.scenario_id
       WHERE s.session_id = ?`,
      [sessionId]
    );
    const context = sessionRows[0]?.context || "Daily conversation";

    // 3) 히스토리 조회
    const allMessages = await aiTalkModel.getMessagesBySession(sessionId);
    const history = allMessages
      .filter((m) => m.message_id !== userMsgObj.message_id)
      .slice(-10)
      .map((m) => ({
        role: m.sender_role,
        content: m.content,
      }));

    // 4) LLM 호출
    let reply = "I heard you.";
    let feedback = null;

    try {
      const llmResult = await generateTalkResponse(
        context,
        history,
        content,
        level
      );
      reply = llmResult.reply;
      feedback = llmResult.feedback;
    } catch (e) {
      console.error("LLM Response Error:", e);
      reply = "Sorry, I'm having trouble thinking right now.";
    }

    // ✅ 5) AI 응답 음성 생성 (TTS)
    let aiAudio: Buffer | null = null;
    try {
      aiAudio = await generateSpeech(reply);
    } catch (e) {
      console.error("TTS generation failed:", e);
    }

    // 6) AI 메시지 및 피드백 저장
    const aiMsgObj = await aiTalkModel.createMessage(sessionId, "ai", reply);

    if (feedback) {
      await aiTalkModel.createFeedback(userMsgObj.message_id, feedback);
    }

    return {
      userMessage: { ...userMsgObj, feedback },
      aiMessage: aiMsgObj,
      aiAudio, // ✅ 컨트롤러로 오디오 버퍼 전달
    };
  },

  // ✅ 3. 음성 메시지 처리 (오디오 입력 -> STT -> AI 처리)
  processUserAudio: async (
    sessionId: number,
    userId: number,
    audioBuffer: Buffer,
    level: string
  ) => {
    // 1) STT 변환 (음성 -> 텍스트)
    let transcribedText = "";
    try {
      transcribedText = await transcribeAudio(audioBuffer, "webm"); // 프론트에서 webm 전송 가정
      if (!transcribedText) transcribedText = "(Unintelligible audio)";
    } catch (e) {
      console.error("STT Error:", e);
      throw new Error("Failed to transcribe audio");
    }

    // 2) 변환된 텍스트로 기존 메시지 처리 로직 재사용
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
