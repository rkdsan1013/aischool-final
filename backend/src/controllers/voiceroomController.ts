// backend/src/controllers/voiceroomController.ts
import { Pool } from "mysql2/promise";
import * as service from "../services/voiceroomService";

/**
 * Controller layer
 * - 라우터가 직접 호출하는 함수들을 named export로 제공합니다.
 * - 각 함수는 service 레이어를 호출하고 결과를 반환합니다.
 * - 에러는 그대로 상위(라우터의 asyncHandler)로 전달됩니다.
 *
 * 라우터(voiceroomRouter.ts)는 아래 함수들을 import 하여 사용합니다:
 * createRoom, listRooms, getRoomById, updateRoom, patchRoom, deleteRoom
 */

/** POST /voice-room */
export async function createRoom(pool: Pool, payload: any) {
  // payload validation is handled in service
  return await service.createVoiceRoom(pool, payload);
}

/** GET /voice-room */
export async function listRooms(pool: Pool, options?: any) {
  // options: { page, size, level }
  return await service.listVoiceRooms(pool, options);
}

/** GET /voice-room/:id */
export async function getRoomById(pool: Pool, roomId: any) {
  return await service.getVoiceRoomById(pool, roomId);
}

/** PUT /voice-room/:id */
export async function updateRoom(pool: Pool, roomId: any, payload: any) {
  return await service.updateVoiceRoom(pool, roomId, payload);
}

/** PATCH /voice-room/:id */
export async function patchRoom(pool: Pool, roomId: any, payload: any) {
  return await service.patchVoiceRoom(pool, roomId, payload);
}

/** DELETE /voice-room/:id */
export async function deleteRoom(pool: Pool, roomId: any) {
  return await service.deleteVoiceRoom(pool, roomId);
}
