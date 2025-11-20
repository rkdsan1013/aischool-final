// backend/src/utils/gamification.ts

// 문제당 기본 점수
const BASE_SCORE = 10;

/**
 * CEFR 레벨별 점수 가중치 계산
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

  return Math.floor(BASE_SCORE * multiplier);
}

/**
 * [신규] 총 점수에 따른 티어 계산
 */
export function getTierByScore(score: number): string {
  if (score >= 10000) return "Challenger";
  if (score >= 5000) return "Master";
  if (score >= 2500) return "Diamond";
  if (score >= 1000) return "Platinum";
  if (score >= 500) return "Gold";
  if (score >= 200) return "Silver";
  return "Bronze";
}
