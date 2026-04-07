import React, { useEffect, useRef } from "react";
import {
  getGoogleClientId,
  loadGoogleIdentityScript,
  type GoogleCredentialResponse,
} from "../utils/googleIdentity";

export interface GoogleSignInButtonProps {
  mode: "login" | "register";
  onCredential: (credential: string) => void;
  onScriptError: (message: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode,
  onCredential,
  onScriptError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = getGoogleClientId();

  useEffect(() => {
    if (!clientId || !containerRef.current) return undefined;

    const el = containerRef.current;
    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled) return;
        const g = window.google?.accounts?.id;
        if (!g) {
          onScriptError("Google 로그인을 불러오지 못했습니다.");
          return;
        }
        el.innerHTML = "";
        g.initialize({
          client_id: clientId,
          callback: (res: GoogleCredentialResponse) => {
            if (res.credential) onCredential(res.credential);
            else onScriptError("Google 인증에 실패했습니다.");
          },
        });
        g.renderButton(el, {
          theme: "outline",
          size: "large",
          text: mode === "register" ? "signup_with" : "continue_with",
          width: "384",
          locale: "ko",
        });
      })
      .catch(() => {
        if (!cancelled) onScriptError("Google 스크립트를 불러오지 못했습니다.");
      });

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [clientId, mode, onCredential, onScriptError]);

  if (!clientId) {
    return (
      <p className="auth-google-hint muted">
        Google 로그인을 사용하려면 루트 <code>.env</code>에{" "}
        <code>VITE_GOOGLE_CLIENT_ID</code>를 넣고 개발 서버를 다시 시작하세요. (Google Cloud Console →
        사용자 인증 정보 → OAuth 2.0 클라이언트 ID, 승인된 JavaScript 원본에{" "}
        <code>http://localhost:5173</code> 등을 추가)
      </p>
    );
  }

  return <div ref={containerRef} className="google-signin-btn-wrap" />;
};
