import type { AuthUser } from "../types";
import { apiFetch, handleJsonResponse, handleVoidResponse, parseApiErrorText, parseApiJson } from "./http";

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await apiFetch("/api/auth/me", { method: "GET" });
  const text = await res.text();
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(parseApiErrorText(text, res.status));
  return parseApiJson<AuthUser>(text);
}

export async function apiLogout(): Promise<void> {
  const res = await apiFetch("/api/auth/logout", { method: "POST", body: "{}" });
  await handleVoidResponse(res);
}

export async function apiRegister(username: string, password: string): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
  });
  return handleJsonResponse<AuthUser>(res);
}

export async function apiLogin(username: string, password: string): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
  });
  return handleJsonResponse<AuthUser>(res);
}

export async function apiGoogleAuth(credential: string): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  return handleJsonResponse<AuthUser>(res);
}
