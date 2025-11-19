import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { aiTalkController } from "../controllers/aiTalkController";

const aiTalkRouter = Router();

// 모든 라우트에 로그인 인증 적용
aiTalkRouter.use(requireAuth);

// --- 시나리오 관련 (기본 경로: /api/ai-talk) ---
// GET /api/ai-talk/scenarios
aiTalkRouter.get("/scenarios", aiTalkController.getScenarios);

// POST /api/ai-talk/scenarios (커스텀 생성)
aiTalkRouter.post("/scenarios", aiTalkController.createScenario);

// PUT /api/ai-talk/scenarios/:id (수정)
aiTalkRouter.put("/scenarios/:id", aiTalkController.updateScenario);

// DELETE /api/ai-talk/scenarios/:id (삭제)
aiTalkRouter.delete("/scenarios/:id", aiTalkController.deleteScenario);

// --- 세션 및 메시지 관련 ---
// POST /api/ai-talk/sessions (대화 시작)
aiTalkRouter.post("/sessions", aiTalkController.startSession);

// POST /api/ai-talk/sessions/:id/messages (메시지 전송)
aiTalkRouter.post("/sessions/:id/messages", aiTalkController.sendMessage);

// PATCH /api/ai-talk/sessions/:id/end (대화 종료)
aiTalkRouter.patch("/sessions/:id/end", aiTalkController.endSession);

export default aiTalkRouter;
