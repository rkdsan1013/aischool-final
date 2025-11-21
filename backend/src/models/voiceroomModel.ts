// backend/src/models/voiceroomModel.ts
import { Pool } from "mysql2/promise";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * DB 레이어: SQL 실행만 담당
 * - pool을 주입받아 쿼리 실행 후 결과를 반환합니다.
 * - 비즈니스 유효성 검사는 서비스 레이어에서 수행하세요.
 */

export type VoiceRoomLevel = "ANY" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type VoiceRoomRow = {
  room_id: number;
  name: string;
  description: string;
  level: VoiceRoomLevel;
  max_participants: number;
  created_at: string | null;
};

export async function insertVoiceRoom(
  pool: Pool,
  payload: {
    name: string;
    description: string;
    level: VoiceRoomLevel;
    max_participants: number;
  }
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    const [result] = (await conn.execute(
      `INSERT INTO voice_room (name, description, level, max_participants)
       VALUES (?, ?, ?, ?)`,
      [
        payload.name,
        payload.description,
        payload.level,
        payload.max_participants,
      ]
    )) as unknown as [ResultSetHeader, any];
    return result.insertId;
  } finally {
    conn.release();
  }
}

export async function findVoiceRoomById(
  pool: Pool,
  roomId: number
): Promise<VoiceRoomRow | null> {
  const conn = await pool.getConnection();
  try {
    const [rows] = (await conn.execute(
      `SELECT room_id, name, description, level, max_participants, created_at
       FROM voice_room WHERE room_id = ?`,
      [roomId]
    )) as unknown as [RowDataPacket[] & VoiceRoomRow[], any];
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
}

export async function selectVoiceRooms(
  pool: Pool,
  options?: { page?: number; size?: number; level?: VoiceRoomLevel }
): Promise<VoiceRoomRow[]> {
  // 기본값 및 정수화
  const page = Math.max(1, Math.floor(Number(options?.page || 1)));
  const size = Math.min(
    100,
    Math.max(1, Math.floor(Number(options?.size || 20)))
  );
  const offset = (page - 1) * size;

  const conn = await pool.getConnection();
  try {
    // level이 배열로 들어오는 경우 방어 처리: 첫 번째 값 사용하거나 에러 처리
    const rawLevel = options?.level;
    if (rawLevel !== undefined && rawLevel !== null) {
      if (Array.isArray(rawLevel)) {
        // 여러 값이 들어오면 첫 번째 값만 사용 (원하면 400 에러로 바꿀 수 있음)
        console.warn(
          "[selectVoiceRooms] level is array, using first element:",
          rawLevel
        );
      }
      const level = String(Array.isArray(rawLevel) ? rawLevel[0] : rawLevel);

      // SQL에 LIMIT/OFFSET은 직접 삽입 (숫자이므로 안전), level만 바인딩
      const sql = `
        SELECT room_id, name, description, level, max_participants, created_at
        FROM voice_room
        WHERE level = ?
        ORDER BY created_at DESC
        LIMIT ${size} OFFSET ${offset}
      `;
      console.debug("[selectVoiceRooms] SQL:", sql.trim());
      console.debug("[selectVoiceRooms] params:", [level]);

      const [rows] = (await conn.execute(sql, [level])) as unknown as [
        RowDataPacket[] & VoiceRoomRow[],
        any
      ];
      return rows;
    } else {
      // level 미지정: LIMIT/OFFSET 직접 삽입, 파라미터 없음
      const sql = `
        SELECT room_id, name, description, level, max_participants, created_at
        FROM voice_room
        ORDER BY created_at DESC
        LIMIT ${size} OFFSET ${offset}
      `;
      console.debug("[selectVoiceRooms] SQL:", sql.trim());
      console.debug("[selectVoiceRooms] params: none");

      const [rows] = (await conn.execute(sql)) as unknown as [
        RowDataPacket[] & VoiceRoomRow[],
        any
      ];
      return rows;
    }
  } catch (err: unknown) {
    const stackOrMessage =
      err instanceof Error ? err.stack ?? err.message : String(err);
    console.error("[selectVoiceRooms] SQL execution error:", stackOrMessage);
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateVoiceRoomRow(
  pool: Pool,
  roomId: number,
  payload: {
    name: string;
    description: string;
    level: VoiceRoomLevel;
    max_participants: number;
  }
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    const [result] = (await conn.execute(
      `UPDATE voice_room
       SET name = ?, description = ?, level = ?, max_participants = ?
       WHERE room_id = ?`,
      [
        payload.name,
        payload.description,
        payload.level,
        payload.max_participants,
        roomId,
      ]
    )) as unknown as [ResultSetHeader, any];
    return result.affectedRows;
  } finally {
    conn.release();
  }
}

export async function patchVoiceRoomRow(
  pool: Pool,
  roomId: number,
  updates: { sql: string; params: any[] }
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    const sql = `UPDATE voice_room SET ${updates.sql} WHERE room_id = ?`;
    const params = [...updates.params, roomId];
    const [result] = (await conn.execute(sql, params)) as unknown as [
      ResultSetHeader,
      any
    ];
    return result.affectedRows;
  } finally {
    conn.release();
  }
}

export async function deleteVoiceRoomRow(
  pool: Pool,
  roomId: number
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    const [result] = (await conn.execute(
      `DELETE FROM voice_room WHERE room_id = ?`,
      [roomId]
    )) as unknown as [ResultSetHeader, any];
    return result.affectedRows;
  } finally {
    conn.release();
  }
}
