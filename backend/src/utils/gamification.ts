// backend/src/utils/gamification.ts

// 문제당 기본 점수
const BASE_SCORE = 10;

/**
 * CEFR 레벨별 점수 가중치 계산
 * - A1 (1.0배) ~ C2 (2.0배)
 * - 백엔드에서만 관리하므로 프론트에서 조작 불가능
 */
export function calculatePoints(level: string | undefined): number {
  const normalized = level?.toUpperCase() ?? "A1";

  let multiplier = 1.0;
  switch (normalized) {
    case "A1":
      multiplier = 1.0;
      break;
    case "A2":
      multiplier = 1.2;
      break;
    case "B1":
      multiplier = 1.4;
      break;
    case "B2":
      multiplier = 1.6;
      break;
    case "C1":
      multiplier = 1.8;
      break;
    case "C2":
      multiplier = 2.0;
      break;
    default:
      multiplier = 1.0;
  }

  // 소수점 버림 처리 (정수 반환)
  return Math.floor(BASE_SCORE * multiplier);
}
