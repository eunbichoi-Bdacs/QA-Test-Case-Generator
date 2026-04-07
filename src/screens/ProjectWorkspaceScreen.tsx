import React, { useCallback, useEffect, useState } from "react";
import { parseWithClaude } from "../api/parseWithClaude";
import { getProjectApi, patchProjectWorkspaceApi } from "../api/projectApi";
import { AppFlowSteps } from "../components/AppFlowSteps";
import { MainTabNav } from "../components/MainTabNav";
import type { MainAppTab, ProjectWorkspace } from "../types";
import { sheetsFromClaudeResponse } from "../utils/claudeToSheets";
import { InputScreen } from "./InputScreen";
import { ResultsScreen } from "./ResultsScreen";

export interface ProjectWorkspaceScreenProps {
  username: string;
  projectId: string;
  onBackToProjects: () => void;
  onLogout: () => void;
}

export const ProjectWorkspaceScreen: React.FC<ProjectWorkspaceScreenProps> = ({
  username,
  projectId,
  onBackToProjects,
  onLogout,
}) => {
  const [projectName, setProjectName] = useState("");
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    getProjectApi(projectId)
      .then((rec) => {
        if (cancelled) return;
        setProjectName(rec.name);
        setWorkspace(rec.workspace);
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) onBackToProjects();
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, onBackToProjects]);

  useEffect(() => {
    if (!hydrated || !workspace) return;
    const t = window.setTimeout(() => {
      void patchProjectWorkspaceApi(projectId, workspace).catch(() => {
        /* 저장 실패는 조용히 무시; 필요 시 토스트 추가 */
      });
    }, 450);
    return () => window.clearTimeout(t);
  }, [workspace, hydrated, projectId]);

  const setMainTab = useCallback((tab: MainAppTab) => {
    setWorkspace((w) => (w ? { ...w, mainTab: tab } : w));
  }, []);

  const setPrd = useCallback((prd: string) => {
    setWorkspace((w) => (w ? { ...w, prd } : w));
  }, []);

  const setTabGroups = useCallback((tabGroups: ProjectWorkspace["tabGroups"]) => {
    setWorkspace((w) => (w ? { ...w, tabGroups } : w));
  }, []);

  const setActiveDesignTabIndex = useCallback((activeDesignTabIndex: number) => {
    setWorkspace((w) => (w ? { ...w, activeDesignTabIndex } : w));
  }, []);

  const setSheets = useCallback((sheets: ProjectWorkspace["sheets"]) => {
    setWorkspace((w) => (w ? { ...w, sheets } : w));
  }, []);

  const onGenerate = useCallback(async () => {
    if (!workspace) return;
    setGenError(null);
    setLoading(true);
    try {
      const res = await parseWithClaude(workspace.prd, workspace.tabGroups);
      const nextSheets = sheetsFromClaudeResponse(res);
      setWorkspace((w) =>
        w
          ? {
              ...w,
              sheets: nextSheets,
              policyNotes: res.errors ?? [],
              mainTab: "results",
            }
          : w
      );
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "생성 요청 실패");
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const flowActive = workspace?.mainTab === "results" ? "tc" : "prd";

  if (!workspace) {
    return (
      <div className="app-root">
        <main className="app-main">
          <p className="muted">불러오는 중…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <header className="app-header app-header--bar">
        <div className="app-header__row app-header__row--workspace">
          <div className="workspace-breadcrumb">
            <button type="button" className="btn btn--ghost workspace-breadcrumb__back" onClick={onBackToProjects}>
              ← 프로젝트 목록
            </button>
            <span className="workspace-breadcrumb__sep" aria-hidden>
              /
            </span>
            <h1 className="app-title app-title--inline workspace-breadcrumb__project">{projectName}</h1>
          </div>
          <div className="app-header__actions">
            <span className="app-header__user workspace-user">{username}</span>
            <button type="button" className="btn btn--ghost" onClick={onLogout}>
              로그아웃
            </button>
          </div>
        </div>
        <AppFlowSteps active={flowActive} />
        <div className="workspace-main-tabs-wrap">
          <MainTabNav active={workspace.mainTab} onChange={setMainTab} />
        </div>
      </header>

      <main className="app-main">
        {workspace.mainTab === "input" ? (
          <InputScreen
            prd={workspace.prd}
            onPrdChange={setPrd}
            tabGroups={workspace.tabGroups}
            onTabGroupsChange={setTabGroups}
            activeDesignTabIndex={workspace.activeDesignTabIndex}
            onActiveDesignTabIndex={setActiveDesignTabIndex}
            onGenerate={onGenerate}
            loading={loading}
            error={genError}
          />
        ) : (
          <ResultsScreen
            sheets={workspace.sheets}
            onSheetsChange={setSheets}
            policyNotes={workspace.policyNotes}
          />
        )}
      </main>
    </div>
  );
};
