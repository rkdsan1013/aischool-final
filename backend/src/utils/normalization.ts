// backend/src/utils/normalization.ts

/**
 * 비교를 위한 텍스트 정규화 함수
 * - 소문자 변환
 * - 축약형 확장 (I'm -> I am, don't -> do not 등)
 * - 특수문자 제거
 * - 공백 정리
 */
export function normalizeForCompare(text: string): string {
  if (!text) return "";

  return (
    text
      .normalize("NFKC")
      // 1. 스마트 따옴표 등을 일반 따옴표로 변경
      .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
      .replace(/\u00A0/g, " ") // Non-breaking space 제거

      // 2. 축약형 풀기 (Frontend 로직과 동일하게 유지)
      .replace(/\b(i|you|he|she|it|we|they)'m\b/gi, "$1 am")
      .replace(/\b(i|you|he|she|it|we|they)'re\b/gi, "$1 are")
      .replace(/\b(i|you|he|she|it|we|they)'ve\b/gi, "$1 have")
      .replace(/\b(i|you|he|she|it|we|they)'ll\b/gi, "$1 will")
      .replace(/\b(i|you|he|she|it|we|they)'d\b/gi, "$1 would") // 'd는 had일수도 있지만 보통 회화에선 would 빈도가 높음
      .replace(/\bcan't\b/gi, "cannot")
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\bdoesn't\b/gi, "does not")
      .replace(/\bdidn't\b/gi, "did not")
      .replace(/\bwon't\b/gi, "will not")
      .replace(/\bisn't\b/gi, "is not")
      .replace(/\baren't\b/gi, "are not")
      .replace(/\bwasn't\b/gi, "was not")
      .replace(/\bweren't\b/gi, "were not")
      .replace(/\blet's\b/gi, "let us")
      .replace(/\bthat's\b/gi, "that is")
      .replace(/\bwhat's\b/gi, "what is")

      // 3. 특수문자 제거 및 공백 정리
      .replace(/[.,!?'"]/g, "") // 따옴표, 마침표 등 제거
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}
