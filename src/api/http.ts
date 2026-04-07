/**
 * API 요청 베이스 URL (배포 시 백엔드가 다른 도메인이면 필수)
 * 예: https://your-api.railway.app  (끝 슬래시 없이)
 * 비우면 현재 사이트 기준 상대 경로 /api/... (로컬 프록시·동일 오리진용)
 */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const headers = new Headers(init?.headers);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });
}

export function parseApiErrorText(text: string, status: number): string {
  const t = text.trim();
  if (t.startsWith("<") || t.toLowerCase().startsWith("<!doctype")) {
    return `서버가 HTML 페이지를 반환했습니다 (${status}). API 서버 주소가 잘못됐거나, 프론트만 배포된 경우일 수 있습니다.`;
  }
  try {
    const j = JSON.parse(text) as { error?: string };
    if (j.error) return j.error;
  } catch {
    /* ignore */
  }
  return t.slice(0, 200) || `요청 실패 (${status})`;
}

export function parseApiJson<T>(text: string): T {
  const t = text.trim();
  if (t.startsWith("<") || t.toLowerCase().startsWith("<!doctype")) {
    throw new Error(
      "API가 JSON 대신 웹 페이지(HTML)를 돌려줬습니다. Vercel 등에서는 /api가 실제 서버로 가지 않고 index.html이 나오는 경우가 많습니다. 백엔드 전체 URL을 환경 변수 VITE_API_BASE_URL에 넣거나, 로컬에서는 터미널에서 npm run dev 로 API(8787)와 Vite(5173)를 함께 실행하세요."
    );
  }
  try {
    return JSON.parse(t) as T;
  } catch {
    throw new Error(t.slice(0, 120) || "JSON 파싱 실패");
  }
}

export async function readApiError(res: Response): Promise<string> {
  const text = await res.text();
  return parseApiErrorText(text, res.status);
}

/** 본문을 한 번만 읽고 성공 시 JSON, 실패 시 에러 메시지 */
export async function handleJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiErrorText(text, res.status));
  return parseApiJson<T>(text);
}

/** 성공 시 본문 없음·JSON 무시 가능 */
export async function handleVoidResponse(res: Response): Promise<void> {
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiErrorText(text, res.status));
}
