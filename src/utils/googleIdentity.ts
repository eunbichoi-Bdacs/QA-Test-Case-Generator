/** Google Identity Services (gsi) — 브라우저 전역 */
export type GoogleCredentialResponse = { credential: string; select_by?: string };

type GsiIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme?: string; size?: string; text?: string; width?: string; locale?: string }
  ) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GsiIdApi } };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "").trim();
}

let loadPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("GSI script error")), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GSI script load failed"));
    document.head.appendChild(s);
  });
  return loadPromise;
}

export interface GoogleJwtPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
}

/** 클라이언트 편의용 디코딩. 토큰 위조 방지는 서버에서 검증해야 합니다. */
export function parseGoogleCredentialJwt(credential: string): GoogleJwtPayload | null {
  try {
    const parts = credential.split(".");
    if (parts.length < 2) return null;
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = atob(b64);
    const payload = JSON.parse(json) as GoogleJwtPayload;
    if (typeof payload.sub !== "string") return null;
    if (payload.exp != null && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
