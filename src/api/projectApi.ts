import type { ProjectRecord, ProjectWorkspace } from "../types";
import { apiFetch, readApiError } from "./http";

export async function listProjectsApi(): Promise<ProjectRecord[]> {
  const res = await apiFetch("/api/projects", { method: "GET" });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as ProjectRecord[];
}

export async function createProjectApi(name: string): Promise<ProjectRecord> {
  const res = await apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() || "새 프로젝트" }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as ProjectRecord;
}

export async function getProjectApi(projectId: string): Promise<ProjectRecord> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: "GET" });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as ProjectRecord;
}

export async function patchProjectWorkspaceApi(
  projectId: string,
  workspace: ProjectWorkspace
): Promise<void> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    body: JSON.stringify({ workspace }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
}

export async function deleteProjectApi(projectId: string): Promise<void> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await readApiError(res));
}
