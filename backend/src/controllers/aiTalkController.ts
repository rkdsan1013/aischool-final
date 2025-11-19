import { Request, Response } from "express";
import { aiTalkService } from "../services/aiTalkService";

export const aiTalkController = {
  // GET /api/scenarios
  getScenarios: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const scenarios = await aiTalkService.getScenarios(userId);
      res.json(scenarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // POST /api/scenarios (커스텀 생성)
  createScenario: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const { title, description, context } = req.body;
      const newScenario = await aiTalkService.createCustomScenario(userId, {
        title,
        description,
        context,
      });
      res.status(201).json(newScenario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create scenario" });
    }
  },

  // PUT /api/scenarios/:id
  updateScenario: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const scenarioId = Number(req.params.id);
      const success = await aiTalkService.updateCustomScenario(
        scenarioId,
        userId,
        req.body
      );
      if (!success)
        return res.status(403).json({ message: "Forbidden or Not Found" });
      res.json({ message: "Updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Update failed" });
    }
  },

  // DELETE /api/scenarios/:id
  deleteScenario: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const scenarioId = Number(req.params.id);
      const success = await aiTalkService.deleteCustomScenario(
        scenarioId,
        userId
      );
      if (!success)
        return res.status(403).json({ message: "Forbidden or Not Found" });
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Delete failed" });
    }
  },

  // POST /api/sessions (대화 시작)
  startSession: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const { scenario_id } = req.body;

      // 세션 시작 + 첫 AI 메시지 생성
      const result = await aiTalkService.startSession(userId, scenario_id);

      // 프론트엔드 인터페이스(AISession, InitialMessages)에 맞게 반환
      res.status(201).json({
        session: { session_id: result.session_id },
        initialMessages: result.initial_messages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to start session" });
    }
  },

  // POST /api/sessions/:id/messages (메시지 전송)
  sendMessage: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const sessionId = Number(req.params.id);
      const { content } = req.body;

      const result = await aiTalkService.processUserMessage(
        sessionId,
        userId,
        content
      );
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send message" });
    }
  },

  // PATCH /api/sessions/:id/end
  endSession: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const sessionId = Number(req.params.id);
      await aiTalkService.endSession(sessionId, userId);
      res.json({ message: "Session ended" });
    } catch (error) {
      res.status(500).json({ message: "Failed to end session" });
    }
  },
};
