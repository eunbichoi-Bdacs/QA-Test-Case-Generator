import React, { useCallback, useState } from "react";
import { apiGoogleAuth, apiLogin, apiRegister } from "../api/authApi";
import { AppFlowSteps } from "../components/AppFlowSteps";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import type { AuthUser } from "../types";

export interface LoginScreenProps {
  onLoggedIn: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoggedIn }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    const u = username.trim().toLowerCase();
    setPending(true);
    try {
      if (mode === "register") {
        const user = await apiRegister(u, password);
        onLoggedIn(user);
        return;
      }
      const user = await apiLogin(u, password);
      onLoggedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 실패");
    } finally {
      setPending(false);
    }
  };

  const onGoogleCredential = useCallback(
    async (credential: string) => {
      setError(null);
      setPending(true);
      try {
        const user = await apiGoogleAuth(credential);
        onLoggedIn(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google 로그인 실패");
      } finally {
        setPending(false);
      }
    },
    [onLoggedIn]
  );

  const onGoogleScriptError = useCallback((msg: string) => setError(msg), []);

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <AppFlowSteps active="login" />
        <h1 className="auth-card__title">QA 테스트 케이스 생성기</h1>
        <p className="auth-card__lead">
          로그인 후 <strong>프로젝트별</strong>로 PRD와 Figma를 올리고, TC를 생성합니다. 입력·생성
          데이터는 서버 <strong>SQLite DB</strong>에 저장됩니다. Google 계정으로도 가입·로그인할 수
          있습니다.
        </p>

        <div className="auth-google-block">
          <GoogleSignInButton
            mode={mode}
            onCredential={onGoogleCredential}
            onScriptError={onGoogleScriptError}
          />
        </div>

        <div className="auth-divider" role="separator">
          <span>또는 아이디로</span>
        </div>

        <div className="auth-mode-toggle" role="tablist" aria-label="로그인 또는 가입">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`auth-mode-toggle__btn${mode === "login" ? " auth-mode-toggle__btn--active" : ""}`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            로그인
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={`auth-mode-toggle__btn${mode === "register" ? " auth-mode-toggle__btn--active" : ""}`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            계정 만들기
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => void submit(e)}>
          <label className="auth-form__field">
            아이디
            <input
              className="tc-input auth-form__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={2}
            />
            <span className="auth-form__field-hint muted">Google 로그인 시 이메일이 아이디로 쓰입니다.</span>
          </label>
          <label className="auth-form__field">
            비밀번호
            <input
              type="password"
              className="tc-input auth-form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              minLength={4}
            />
          </label>
          {error && <p className="auth-form__error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--large auth-form__submit" disabled={pending}>
            {pending ? "처리 중…" : mode === "register" ? "가입하고 시작" : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
};
