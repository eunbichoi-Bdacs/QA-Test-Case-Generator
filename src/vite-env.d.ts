/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TC_API_URL: string;
  readonly VITE_USE_MOCK: string;
  /** Google Cloud Console → OAuth 2.0 클라이언트 ID (웹). 비우면 Google 버튼 숨김 */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
