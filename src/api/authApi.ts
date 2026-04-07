import type { AuthUser } from "../types";
import { apiFetch, readApiError } from "./http";

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await apiFetch("/api/auth/me", { method: "GET" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as AuthUser;
}

export async function apiLogout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST", body: "{}" });
}

export async function apiRegister(username: string, password: string): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as AuthUser;
}

export async function apiLogin(username: string, password: string): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as AuthUser;
}

export async function apiGoogleAuth(credential: string): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  return (await res.json()) as AuthUser;
}
