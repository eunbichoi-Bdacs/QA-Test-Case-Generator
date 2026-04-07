/** Vite 개발 시 `/api` → 프록시(8787). 프로덕션은 동일 오리진 또는 환경에 맞게 조정 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
}

export async function readApiError(res: Response): Promise<string> {
  const t = await res.text();
  try {
    const j = JSON.parse(t) as { error?: string };
    if (j.error) return j.error;
  } catch {
    /* ignore */
  }
  return t || `요청 실패 (${res.status})`;
}
