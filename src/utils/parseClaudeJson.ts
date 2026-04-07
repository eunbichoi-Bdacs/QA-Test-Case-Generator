import type { ClaudeResponse } from "../types";

/** API가 텍스트/마크다운으로 감싼 JSON을 줄 때 보조 파싱 */
export const parseClaudeJson = (raw: string): ClaudeResponse => {
  const t = raw.trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("응답에서 JSON 객체를 찾을 수 없습니다.");
  }
  return JSON.parse(t.slice(start, end + 1)) as ClaudeResponse;
};
