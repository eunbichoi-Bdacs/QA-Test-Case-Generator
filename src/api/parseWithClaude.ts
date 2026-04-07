import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import type { ClaudeResponse, TabGroup } from "../types";
import { parseClaudeJson } from "../utils/parseClaudeJson";
import { getMockClaudeResponse } from "./mockTcResponse";

/**
 * 백엔드가 Claude(또는 동등 모델)를 호출해 JSON을 돌려주도록 가정합니다.
 * .env: VITE_TC_API_URL=/api (Vite 프록시) 또는 전체 URL
 * POST body: { systemPrompt, prd, tabGroups }
 */
export const parseWithClaude = async (
  prd: string,
  tabGroups: TabGroup[]
): Promise<ClaudeResponse> => {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    return getMockClaudeResponse(tabGroups.map((g) => g.name));
  }

  const base = import.meta.env.VITE_TC_API_URL?.replace(/\/$/, "") ?? "";
  if (!base) {
    throw new Error(
      "VITE_TC_API_URL이 비어 있습니다. .env에 예: VITE_TC_API_URL=/api 를 설정하세요."
    );
  }

  const url = `${base}/generate-tc`;
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      prd,
      tabGroups,
    }),
  });

  const ct = res.headers.get("content-type") ?? "";
  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(bodyText || `요청 실패 (${res.status})`);
  }

  if (ct.includes("application/json")) {
    return JSON.parse(bodyText) as ClaudeResponse;
  }

  return parseClaudeJson(bodyText);
};
