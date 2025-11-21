// frontend/src/services/aiTalkService.ts

import { apiClient, handleApiError } from "../api";

// --- 1. 타입 정의 (DB 스키마와 1:1 매칭) ---

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

/**
 * 대화 세션
 * - status 필드 삭제됨
 * - ended_at으로 종료 여부 및 학습 시간 판단
 */
export interface AISession {
  session_id: number;
  scenario_id: number;
  user_id: number;
  started_at: string;
  ended_at: string | null; // null이면 진행 중, 값이 있으면 종료됨
}

/**
 * AI 피드백 (DB의 JSON 컬럼 구조 평탄화)
 */
export interface AIFeedback {
  explanation: string;
  suggestion: string;
  errors: Array<{
    index?: number;
    word?: string;
    type: string;
    message: string;
  }>;
}

/**
 * 대화 메시지
 * - audio_url 삭제됨
 * - feedback은 AIFeedback 타입의 객체 (JSON)
 */
export interface AIMessage {
  message_id: number;
  session_id: number;
  sender_role: "user" | "ai";
  content: string;
  created_at: string;
  feedback?: AIFeedback | null;
}

export interface SendMessageResponse {
  userMessage: AIMessage;
  aiMessage: AIMessage;
}

// --- 2. 개별 함수 Export (컴포넌트 편의용) ---

export async function createScenario(
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
}

export async function updateScenario(
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
}

// --- 3. 메인 서비스 객체 Export ---

export const aiTalkService = {
  // === 시나리오 관련 (CRUD) ===

  async getScenarios(): Promise<AIScenario[]> {
    try {
      const { data } = await apiClient.get<AIScenario[]>("/ai-talk/scenarios");
      return data;
    } catch (error) {
      return handleApiError(error, "시나리오 목록 조회");
    }
  },

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

  async createCustomScenario(
    payload: CreateScenarioRequest
  ): Promise<AIScenario> {
    return createScenario(payload);
  },

  async updateCustomScenario(
    scenarioId: number,
    payload: UpdateScenarioRequest
  ): Promise<AIScenario> {
    return updateScenario(scenarioId, payload);
  },

  async deleteCustomScenario(scenarioId: number): Promise<void> {
    try {
      await apiClient.delete(`/ai-talk/scenarios/${scenarioId}`);
    } catch (error) {
      return handleApiError(error, "시나리오 삭제");
    }
  },

  // === 대화 세션 관련 (핵심 기능) ===

  /**
   * 대화 세션 시작
   * - 항상 새로운 세션을 생성합니다.
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
   * - 유저 메시지를 보내고, AI 응답(+피드백)을 받습니다.
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
   * - 종료 시간을 기록하여 학습 이력을 남깁니다.
   */
  async endSession(sessionId: number): Promise<void> {
    try {
      await apiClient.patch(`/ai-talk/sessions/${sessionId}/end`);
    } catch (error) {
      return handleApiError(error, "대화 종료");
    }
  },

  // 호환성 별칭
  createScenario,
  updateScenario,
};

export default aiTalkService;
