import React, { useCallback, useEffect, useState } from "react";
import { createProjectApi, deleteProjectApi, listProjectsApi } from "../api/projectApi";
import { AppFlowSteps } from "../components/AppFlowSteps";
import type { ProjectRecord } from "../types";

export interface ProjectsScreenProps {
  username: string;
  onOpenProject: (projectId: string) => void;
  onLogout: () => void;
}

function formatUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  username,
  onOpenProject,
  onLogout,
}) => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [newName, setNewName] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reload = useCallback(async () => {
    setLoadError(null);
    try {
      const list = await listProjectsApi();
      setProjects(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleCreate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setPending(true);
    setLoadError(null);
    try {
      await createProjectApi(newName.trim() || "새 프로젝트");
      setNewName("");
      await reload();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "생성 실패");
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm("이 프로젝트를 삭제할까요? 되돌릴 수 없습니다.")) return;
    setPending(true);
    setLoadError(null);
    try {
      await deleteProjectApi(id);
      await reload();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="app-root app-root--projects">
      <header className="app-header app-header--bar">
        <div className="app-header__row">
          <div>
            <h1 className="app-title app-title--inline">내 프로젝트</h1>
            <p className="app-header__meta">
              <span className="app-header__user">{username}</span> 님의 작업만 표시됩니다. (DB 저장)
            </p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onLogout}>
            로그아웃
          </button>
        </div>
        <AppFlowSteps active="projects" />
      </header>

      <main className="app-main">
        {loadError && <p className="input-actions__error">{loadError}</p>}

        <section className="projects-new">
          <h2 className="section-title">새 프로젝트</h2>
          <p className="section-hint">
            프로젝트마다 PRD·Figma·생성된 TC가 DB에 따로 저장됩니다. 여러 건을 동시에 진행할 수
            있습니다.
          </p>
          <form className="projects-new__form" onSubmit={(e) => void handleCreate(e)}>
            <input
              className="tc-input projects-new__input"
              placeholder="프로젝트 이름 (예: 청구서 v2)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="btn btn--primary" disabled={pending}>
              프로젝트 추가
            </button>
          </form>
        </section>

        <section className="projects-grid-section">
          <h2 className="section-title">프로젝트 목록</h2>
          {projects.length === 0 ? (
            <div className="projects-empty">프로젝트가 없습니다. 위에서 새 프로젝트를 만드세요.</div>
          ) : (
            <ul className="projects-grid">
              {projects.map((p) => (
                <li key={p.id} className="project-card-row">
                  <button
                    type="button"
                    className="project-card"
                    onClick={() => onOpenProject(p.id)}
                    disabled={pending}
                  >
                    <span className="project-card__name">{p.name}</span>
                    <span className="project-card__meta">수정 {formatUpdated(p.updatedAt)}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small project-card-row__delete"
                    onClick={() => void handleDelete(p.id)}
                    disabled={pending}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};
