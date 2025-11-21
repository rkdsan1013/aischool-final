// backend/src/services/aiTalkService.ts
import { aiTalkModel } from "../models/aiTalkModel";
// [수정] 리팩토링된 생성 함수들을 import
import {
  generateTalkOpening,
  generateTalkResponse,
} from "../ai/generators/talk";

export const aiTalkService = {
  // --- 시나리오 CRUD (기존 유지) ---
  getScenarios: async (userId: number) => {
    return await aiTalkModel.getScenarios(userId);
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

  // 1. 세션 시작 (시나리오 선택 시)
  startSession: async (userId: number, scenarioId: number) => {
    const scenario = await aiTalkModel.getScenarioById(scenarioId);
    if (!scenario) throw new Error("Scenario not found");

    // 세션 DB 생성
    const sessionId = await aiTalkModel.createSession(userId, scenarioId);

    // ✅ AI의 첫 마디 생성 (LLM 호출)
    let openingText = "";
    try {
      // [수정] 함수 호출 방식 변경
      openingText = await generateTalkOpening(scenario.context);
    } catch (e) {
      console.error("LLM Opening Error:", e);
      openingText = "Hello! I'm ready to talk. (System Error)";
    }

    // AI 메시지로 저장
    const aiMessage = await aiTalkModel.createMessage(
      sessionId,
      "ai",
      openingText
    );

    return {
      session_id: sessionId,
      initial_messages: [aiMessage],
    };
  },

  // 2. 메시지 전송 (User -> AI Reply + Feedback)
  processUserMessage: async (
    sessionId: number,
    userId: number,
    content: string
  ) => {
    // 1. 유저 메시지 저장
    const userMsgObj = await aiTalkModel.createMessage(
      sessionId,
      "user",
      content
    );

    // 2. 시나리오 Context 조회
    // TODO: 실제로는 세션 ID를 통해 DB에서 해당 시나리오의 context를 가져와야 합니다.
    // 현재는 임시 하드코딩 상태입니다.
    const context = "You are a helpful English tutor.";

    // ✅ LLM 호출 (응답 + 피드백)
    let reply = "I heard you.";
    let feedback = null;

    try {
      // [수정] 함수 호출 방식 변경
      const llmResult = await generateTalkResponse(context, content);
      reply = llmResult.reply;
      feedback = llmResult.feedback;
    } catch (e) {
      console.error("LLM Response Error:", e);
      reply = "Sorry, I'm having trouble thinking right now.";
    }

    // 4. AI 메시지 저장
    const aiMsgObj = await aiTalkModel.createMessage(sessionId, "ai", reply);

    // 5. 피드백 저장 (유저 메시지 ID에 연결)
    if (feedback) {
      await aiTalkModel.createFeedback(userMsgObj.message_id, feedback);
    }

    // 6. 응답 반환
    return {
      userMessage: { ...userMsgObj, feedback },
      aiMessage: aiMsgObj,
    };
  },

  endSession: async (sessionId: number, userId: number) => {
    return await aiTalkModel.endSession(sessionId, userId);
  },
};
