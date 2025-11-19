// backend/src/services/aiTalkService.ts
import { aiTalkModel } from "../models/aiTalkModel";
import { aiTalkLLM } from "../llm/models/aiTalkModel";

export const aiTalkService = {
  // --- 시나리오 CRUD ---
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
      openingText = await aiTalkLLM.generateOpening(scenario.context);
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

    // 2. 시나리오 Context 조회 (실제로는 세션 테이블 조인 필요, 여기선 임시 처리)
    // 성능을 위해 세션 시작시 Context를 캐싱하거나, 여기서 DB 조회를 한 번 더 해야 함.
    // 여기서는 쿼리가 복잡해지므로 간소화를 위해 하드코딩된 fallback 혹은 DB 조회 로직 추가 필요.
    // (아래는 DB 모델에 getScenarioBySessionId가 있다고 가정하거나, 임시 컨텍스트 사용)
    const context = "You are a helpful English tutor.";

    // ✅ LLM 호출 (응답 + 피드백)
    let reply = "I heard you.";
    let feedback = null;

    try {
      const llmResult = await aiTalkLLM.generateResponseAndFeedback(
        context,
        content
      );
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
