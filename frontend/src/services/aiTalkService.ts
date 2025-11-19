// frontend/src/services/aiTalkService.ts
import { apiClient, handleApiError } from "../api";

// --- 타입 정의 ---

export interface AIScenario {
  scenario_id: number;
  user_id: number | null;
  title: string;
  description: string;
  context: string;
  created_at?: string;
}

export interface CreateScenarioRequest {
  title: string;
  description: string;
  context: string;
}

export interface UpdateScenarioRequest {
  title?: string;
  description?: string;
  context?: string;
}

export interface AISession {
  session_id: number;
  scenario_id: number;
  user_id: number;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED";
  started_at: string;
}

export interface AIMessage {
  message_id: number;
  session_id: number;
  sender_role: "user" | "ai";
  content: string;
  audio_url?: string;
  created_at: string;
  feedback?: AIFeedback;
}

export interface AIFeedback {
  feedback_id: number;
  message_id: number;
  feedback_data: {
    explanation: string;
    suggestion: string;
    errors: Array<{
      index?: number;
      word?: string;
      type: string;
      message: string;
    }>;
  };
}

export interface SendMessageResponse {
  userMessage: AIMessage;
  aiMessage: AIMessage;
}

// --- 서비스 함수 ---

export const aiTalkService = {
  /**
   * 모든 시나리오 목록 조회
   * [수정됨] 경로: /scenarios -> /ai-talk/scenarios
   */
  async getScenarios(): Promise<AIScenario[]> {
    try {
      const { data } = await apiClient.get<AIScenario[]>("/ai-talk/scenarios");
      return data;
    } catch (error) {
      return handleApiError(error, "시나리오 목록 조회");
    }
  },

  /**
   * 특정 시나리오 상세 조회
   */
  async getScenarioById(scenarioId: number): Promise<AIScenario> {
    try {
      const { data } = await apiClient.get<AIScenario>(
        `/ai-talk/scenarios/${scenarioId}`
      );
      return data;
    } catch (error) {
      return handleApiError(error, "시나리오 상세 조회");
    }
  },

  /**
   * 나만의 시나리오 생성
   */
  async createCustomScenario(
    payload: CreateScenarioRequest
  ): Promise<AIScenario> {
    try {
      const { data } = await apiClient.post<AIScenario>(
        "/ai-talk/scenarios",
        payload
      );
      return data;
    } catch (error) {
      return handleApiError(error, "시나리오 생성");
    }
  },

  /**
   * 나만의 시나리오 수정
   */
  async updateCustomScenario(
    scenarioId: number,
    payload: UpdateScenarioRequest
  ): Promise<AIScenario> {
    try {
      const { data } = await apiClient.put<AIScenario>(
        `/ai-talk/scenarios/${scenarioId}`,
        payload
      );
      return data;
    } catch (error) {
      return handleApiError(error, "시나리오 수정");
    }
  },

  /**
   * 나만의 시나리오 삭제
   */
  async deleteCustomScenario(scenarioId: number): Promise<void> {
    try {
      await apiClient.delete(`/ai-talk/scenarios/${scenarioId}`);
    } catch (error) {
      return handleApiError(error, "시나리오 삭제");
    }
  },

  // --- 대화 세션 관련 ---

  /**
   * 대화 세션 시작
   */
  async startSession(scenarioId: number): Promise<{
    session: AISession;
    initialMessages: AIMessage[];
  }> {
    try {
      const { data } = await apiClient.post<{
        session: AISession;
        initialMessages: AIMessage[];
      }>("/ai-talk/sessions", { scenario_id: scenarioId });
      return data;
    } catch (error) {
      return handleApiError(error, "대화 세션 시작");
    }
  },

  /**
   * 메시지 전송
   */
  async sendMessage(
    sessionId: number,
    content: string
  ): Promise<SendMessageResponse> {
    try {
      const { data } = await apiClient.post<SendMessageResponse>(
        `/ai-talk/sessions/${sessionId}/messages`,
        { content }
      );
      return data;
    } catch (error) {
      return handleApiError(error, "메시지 전송");
    }
  },

  /**
   * 세션 종료
   */
  async endSession(sessionId: number): Promise<void> {
    try {
      await apiClient.patch(`/ai-talk/sessions/${sessionId}/end`);
    } catch (error) {
      return handleApiError(error, "대화 종료");
    }
  },
};
