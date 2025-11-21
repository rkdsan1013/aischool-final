// frontend/src/services/voiceroomService.ts
import type { AxiosResponse } from "axios";
// api 클라이언트와 에러 헬퍼를 가져옵니다. (경로: frontend/src/api/index.ts)
import { apiClient, handleApiError, ServiceError } from "../api";

/**
 * DB 스키마 참고:
 * CREATE TABLE voice_room (
 *   room_id int NOT NULL AUTO_INCREMENT,
 *   name varchar(255) NOT NULL,
 *   description varchar(255) NOT NULL,
 *   level enum('ANY','A1','A2','B1','B2','C1','C2') NOT NULL DEFAULT 'ANY',
 *   max_participants int DEFAULT '8',
 *   created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
 *   PRIMARY KEY (room_id)
 * );
 */

/** 프론트에서 사용할 타입 정의 */
export type VoiceRoomLevel = "ANY" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type VoiceRoom = {
  room_id: number;
  name: string;
  description: string;
  level: VoiceRoomLevel;
  max_participants: number;
  created_at?: string | null;
};

export type CreateVoiceRoomPayload = {
  name: string;
  description: string;
  level?: VoiceRoomLevel;
  max_participants?: number;
};

export type UpdateVoiceRoomPayload = Partial<CreateVoiceRoomPayload>;

/**
 * 방 생성
 */
export async function createRoom(
  payload: CreateVoiceRoomPayload
): Promise<VoiceRoom> {
  try {
    const body = {
      ...payload,
      max_participants:
        payload.max_participants !== undefined
          ? Number(payload.max_participants)
          : undefined,
    };

    const res: AxiosResponse<VoiceRoom> = await apiClient.post(
      "/voice-room",
      body
    );
    return res.data;
  } catch (error) {
    // handleApiError는 내부에서 ServiceError를 던집니다.
    handleApiError(error, "보이스룸 생성");
    // 타입 검사 통과를 위해 명시적 반환(실제로는 위에서 예외가 던져짐)
    return Promise.reject();
  }
}

/**
 * 방 목록 조회
 */
export async function getRooms(params?: {
  page?: number;
  size?: number;
  level?: VoiceRoomLevel;
}): Promise<VoiceRoom[]> {
  try {
    const res: AxiosResponse<VoiceRoom[]> = await apiClient.get("/voice-room", {
      params,
    });
    return res.data;
  } catch (error) {
    handleApiError(error, "보이스룸 목록 조회");
    return Promise.reject();
  }
}

/**
 * 단일 방 조회
 */
export async function getRoomById(roomId: number): Promise<VoiceRoom> {
  try {
    const res: AxiosResponse<VoiceRoom> = await apiClient.get(
      `/voice-room/${roomId}`
    );
    return res.data;
  } catch (error) {
    handleApiError(error, `보이스룸 조회 (id: ${roomId})`);
    return Promise.reject();
  }
}

/**
 * 방 전체 수정 (PUT)
 */
export async function updateRoom(
  roomId: number,
  payload: UpdateVoiceRoomPayload
): Promise<VoiceRoom> {
  try {
    const body = {
      ...payload,
      max_participants:
        payload.max_participants !== undefined
          ? Number(payload.max_participants)
          : undefined,
    };
    const res: AxiosResponse<VoiceRoom> = await apiClient.put(
      `/voice-room/${roomId}`,
      body
    );
    return res.data;
  } catch (error) {
    handleApiError(error, `보이스룸 수정 (id: ${roomId})`);
    return Promise.reject();
  }
}

/**
 * 방 부분 수정 (PATCH)
 */
export async function patchRoom(
  roomId: number,
  payload: UpdateVoiceRoomPayload
): Promise<VoiceRoom> {
  try {
    const body = {
      ...payload,
      max_participants:
        payload.max_participants !== undefined
          ? Number(payload.max_participants)
          : undefined,
    };
    const res: AxiosResponse<VoiceRoom> = await apiClient.patch(
      `/voice-room/${roomId}`,
      body
    );
    return res.data;
  } catch (error) {
    handleApiError(error, `보이스룸 부분 수정 (id: ${roomId})`);
    return Promise.reject();
  }
}

/**
 * 방 삭제
 */
export async function deleteRoom(roomId: number): Promise<void> {
  try {
    await apiClient.delete(`/voice-room/${roomId}`);
    return;
  } catch (error) {
    handleApiError(error, `보이스룸 삭제 (id: ${roomId})`);
    return Promise.reject();
  }
}

/**
 * 간단한 유효성 검사 헬퍼 (프론트에서 서버 호출 전에 사용)
 */
export function validateCreatePayload(payload: CreateVoiceRoomPayload) {
  if (!payload.name || payload.name.trim().length === 0) {
    throw new ServiceError("방 이름을 입력해주세요.");
  }
  if (!payload.description || payload.description.trim().length === 0) {
    throw new ServiceError("방 설명을 입력해주세요.");
  }
  if (
    payload.max_participants !== undefined &&
    (!Number.isFinite(payload.max_participants) ||
      payload.max_participants < 1 ||
      payload.max_participants > 100)
  ) {
    throw new ServiceError(
      "최대 참여 인원은 1 이상 100 이하의 숫자여야 합니다."
    );
  }
  if (
    payload.level !== undefined &&
    !["ANY", "A1", "A2", "B1", "B2", "C1", "C2"].includes(payload.level)
  ) {
    throw new ServiceError("권장 레벨이 유효하지 않습니다.");
  }
}

/**
 * 기본 export: 서비스 객체
 */
const VoiceRoomService = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  patchRoom,
  deleteRoom,
  validateCreatePayload,
};

export default VoiceRoomService;
