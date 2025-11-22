// backend/src/controllers/aiTalkController.ts
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

  // GET /api/scenarios/:id
  getScenarioById: async (req: Request, res: Response) => {
    try {
      const scenarioId = Number(req.params.id);
      const scenario = await aiTalkService.getScenarioById(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // POST /api/scenarios
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
      const level = req.user!.level || "A1";
      const { scenario_id } = req.body;

      const result = await aiTalkService.startSession(
        userId,
        scenario_id,
        level
      );

      // AI 음성이 있으면 Base64로 변환하여 클라이언트에 전달
      const audioBase64 = result.aiAudio
        ? result.aiAudio.toString("base64")
        : null;

      res.status(201).json({
        session: { session_id: result.session_id },
        initialMessages: result.initial_messages,
        audioData: audioBase64, // ✅ 클라이언트에서 재생할 오디오 데이터
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to start session" });
    }
  },

  // POST /api/sessions/:id/messages (텍스트 메시지 전송)
  sendMessage: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const level = req.user!.level || "A1";
      const sessionId = Number(req.params.id);
      const { content } = req.body;

      const result = await aiTalkService.processUserMessage(
        sessionId,
        userId,
        content,
        level
      );

      // AI 음성 Base64 변환
      const audioBase64 = result.aiAudio
        ? result.aiAudio.toString("base64")
        : null;

      res.json({
        ...result,
        audioData: audioBase64, // ✅ 오디오 데이터 포함
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send message" });
    }
  },

  // ✅ [추가] POST /api/sessions/:id/audio (음성 메시지 전송)
  sendAudio: async (req: Request, res: Response) => {
    try {
      const userId = req.user!.user_id;
      const level = req.user!.level || "A1";
      const sessionId = Number(req.params.id);
      const audioFile = req.file; // Multer가 처리한 파일

      if (!audioFile) {
        return res.status(400).json({ message: "No audio file uploaded" });
      }

      // 서비스 호출 (STT -> LLM -> TTS)
      const result = await aiTalkService.processUserAudio(
        sessionId,
        userId,
        audioFile.buffer,
        level
      );

      // AI 음성 Base64 변환
      const audioBase64 = result.aiAudio
        ? result.aiAudio.toString("base64")
        : null;

      res.json({
        ...result,
        audioData: audioBase64,
      });
    } catch (error) {
      console.error("[Controller] sendAudio error:", error);
      res.status(500).json({ message: "Failed to process audio message" });
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
