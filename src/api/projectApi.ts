import type { ProjectRecord, ProjectWorkspace } from "../types";
import { apiFetch, handleJsonResponse, handleVoidResponse } from "./http";

export async function listProjectsApi(): Promise<ProjectRecord[]> {
  const res = await apiFetch("/api/projects", { method: "GET" });
  return handleJsonResponse<ProjectRecord[]>(res);
}

export async function createProjectApi(name: string): Promise<ProjectRecord> {
  const res = await apiFetch("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name: name.trim() || "새 프로젝트" }),
  });
  return handleJsonResponse<ProjectRecord>(res);
}

export async function getProjectApi(projectId: string): Promise<ProjectRecord> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: "GET" });
  return handleJsonResponse<ProjectRecord>(res);
}

export async function patchProjectWorkspaceApi(
  projectId: string,
  workspace: ProjectWorkspace
): Promise<void> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    body: JSON.stringify({ workspace }),
  });
  await handleVoidResponse(res);
}

export async function deleteProjectApi(projectId: string): Promise<void> {
  const res = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
  });
  await handleVoidResponse(res);
}
