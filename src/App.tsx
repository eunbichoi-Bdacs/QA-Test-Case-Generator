import React, { useCallback, useEffect, useState } from "react";
import { apiLogout, fetchAuthMe } from "./api/authApi";
import type { AuthUser } from "./types";
import { LoginScreen } from "./screens/LoginScreen";
import { ProjectWorkspaceScreen } from "./screens/ProjectWorkspaceScreen";
import { ProjectsScreen } from "./screens/ProjectsScreen";

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAuthMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((e) => {
        if (!cancelled) setBootError(e instanceof Error ? e.message : "세션 확인 실패");
      })
      .finally(() => {
        if (!cancelled) setBooted(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    setUser(null);
    setProjectId(null);
  }, []);

  const backToProjects = useCallback(() => {
    setProjectId(null);
  }, []);

  if (!booted) {
    return (
      <div className="app-root">
        <main className="app-main">
          <p className="muted">불러오는 중…</p>
        </main>
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="app-root">
        <main className="app-main">
          <p className="input-actions__error">{bootError}</p>
          <p className="section-hint muted">
            <strong>로컬:</strong> <code>npm run dev</code>로 API(8787)와 Vite(5173)를 같이 띄웁니다.
            <br />
            <strong>배포(Vercel 등):</strong> 프론트만 있으면 <code>/api</code>가 없습니다. Node API를
            Railway·Render 등에 올린 뒤, Vercel 환경 변수에{" "}
            <code>VITE_API_BASE_URL=https://백엔드주소</code> 를 넣고 다시 배포하세요. (쿠키 로그인은
            백엔드에서 <code>SameSite=None; Secure</code> CORS 설정이 필요할 수 있습니다.)
          </p>
        </main>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoggedIn={setUser} />;
  }

  if (!projectId) {
    return (
      <ProjectsScreen username={user.username} onOpenProject={setProjectId} onLogout={() => void logout()} />
    );
  }

  return (
    <ProjectWorkspaceScreen
      username={user.username}
      projectId={projectId}
      onBackToProjects={backToProjects}
      onLogout={() => void logout()}
    />
  );
};

export default App;
