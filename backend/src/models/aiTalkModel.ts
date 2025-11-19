// backend/src/models/aiTalkModel.ts
import { pool } from "../config/db"; // ✅ { pool } 중괄호 추가 (Named Export 대응)
import { ResultSetHeader, RowDataPacket } from "mysql2";

// --- 타입 정의 ---
export interface AIScenario {
  scenario_id: number;
  user_id: number | null;
  title: string;
  description: string;
  context: string;
}

export interface AIMessage {
  message_id: number;
  session_id: number;
  sender_role: "user" | "ai";
  content: string;
  created_at: Date;
}

export const aiTalkModel = {
  // 1. 시나리오 목록 조회
  async getScenarios(userId: number): Promise<AIScenario[]> {
    const query = `
      SELECT * FROM ai_scenarios 
      WHERE user_id IS NULL OR user_id = ?
      ORDER BY user_id IS NOT NULL, created_at DESC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return rows as AIScenario[];
  },

  // 2. 특정 시나리오 조회
  async getScenarioById(scenarioId: number): Promise<AIScenario | null> {
    const query = `SELECT * FROM ai_scenarios WHERE scenario_id = ?`;
    const [rows] = await pool.query<RowDataPacket[]>(query, [scenarioId]);
    return (rows[0] as AIScenario) || null;
  },

  // 3. 커스텀 시나리오 생성
  async createScenario(
    userId: number,
    title: string,
    description: string,
    context: string
  ): Promise<number> {
    const query = `
      INSERT INTO ai_scenarios (user_id, title, description, context, category, is_public)
      VALUES (?, ?, ?, ?, 'custom', 0)
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      userId,
      title,
      description,
      context,
    ]);
    return result.insertId;
  },

  // 4. 커스텀 시나리오 수정
  async updateScenario(
    scenarioId: number,
    userId: number,
    data: { title?: string; description?: string; context?: string }
  ): Promise<boolean> {
    const query = `
      UPDATE ai_scenarios 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          context = COALESCE(?, context)
      WHERE scenario_id = ? AND user_id = ?
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      data.title,
      data.description,
      data.context,
      scenarioId,
      userId,
    ]);
    return result.affectedRows > 0;
  },

  // 5. 시나리오 삭제
  async deleteScenario(scenarioId: number, userId: number): Promise<boolean> {
    const query = `DELETE FROM ai_scenarios WHERE scenario_id = ? AND user_id = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, [
      scenarioId,
      userId,
    ]);
    return result.affectedRows > 0;
  },

  // 6. 세션 생성
  async createSession(userId: number, scenarioId: number): Promise<number> {
    const query = `
      INSERT INTO ai_sessions (user_id, scenario_id, status)
      VALUES (?, ?, 'ACTIVE')
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      userId,
      scenarioId,
    ]);
    return result.insertId;
  },

  // 7. 메시지 생성
  async createMessage(
    sessionId: number,
    role: "user" | "ai",
    content: string
  ): Promise<AIMessage> {
    const query = `
      INSERT INTO ai_messages (session_id, sender_role, content)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      sessionId,
      role,
      content,
    ]);

    return {
      message_id: result.insertId,
      session_id: sessionId,
      sender_role: role,
      content: content,
      created_at: new Date(),
    };
  },

  // 8. 피드백 저장 (JSON)
  async createFeedback(messageId: number, feedbackData: any): Promise<void> {
    const query = `
      INSERT INTO ai_feedbacks (message_id, feedback_data)
      VALUES (?, ?)
    `;
    await pool.query(query, [messageId, JSON.stringify(feedbackData)]);
  },

  // 9. 세션 종료
  async endSession(sessionId: number, userId: number): Promise<void> {
    const query = `
        UPDATE ai_sessions SET status = 'COMPLETED', ended_at = NOW()
        WHERE session_id = ? AND user_id = ?
    `;
    await pool.query(query, [sessionId, userId]);
  },
};
