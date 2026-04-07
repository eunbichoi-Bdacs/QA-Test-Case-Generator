import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  deleteProjectRow,
  findUserByGoogleSub,
  findUserById,
  findUserByUsername,
  getProjectRow,
  insertProject,
  insertUser,
  listProjectsByUser,
  setUserGoogleSub,
  updateProjectWorkspaceRow,
  type ProjectRow,
} from "./db.js";
import { generateTcWithGemini } from "./geminiTc.js";
import { emptyWorkspaceJson } from "./workspaceDefaults.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

/** cwd와 무관하게 저장소 루트의 .env 로드 (로컬). 배포 환경은 플랫폼 Environment만 사용. */
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(serverDir, "..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local") });

const JWT_SECRET = (process.env.JWT_SECRET ?? "").trim();
if (JWT_SECRET.length < 16) {
  console.error("FATAL: JWT_SECRET이 없거나 16자 미만입니다.");
  console.error(`  .env 로드 시도: ${path.join(repoRoot, ".env")}`);
  console.error("  로컬: 위 경로에 JWT_SECRET=최소16자이상 (등호 앞뒤 공백 없이)");
  console.error("  Railway/Render/Vercel(API) 등: 대시보드 Environment Variables에 JWT_SECRET 추가");
  console.error("  (.env 파일은 gitignore라 서버에는 올라가지 않습니다.)");
  process.exit(1);
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const PORT = Number(process.env.PORT) || 8787;
const COOKIE_NAME = "tc_auth";

const app = express();
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

function signAuthCookie(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
}

function setAuthCookie(res: express.Response, userId: string): void {
  const token = signAuthCookie(userId);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearAuthCookie(res: express.Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "로그인이 필요합니다." });
    return;
  }
  try {
    const p = jwt.verify(token, JWT_SECRET) as { sub: string };
    if (!p.sub) throw new Error("no sub");
    req.userId = p.sub;
    next();
  } catch {
    res.status(401).json({ error: "세션이 만료되었습니다." });
  }
}

function publicUser(row: { id: string; username: string }): { id: string; username: string } {
  return { id: row.id, username: row.username };
}

function rowToProject(row: ProjectRow) {
  let workspace: unknown;
  try {
    workspace = JSON.parse(row.workspace_json);
  } catch {
    workspace = JSON.parse(emptyWorkspaceJson());
  }
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    updatedAt: row.updated_at,
    workspace,
  };
}

app.get("/api/auth/me", (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token || typeof token !== "string") {
    res.status(401).json({ error: "로그인되지 않았습니다." });
    return;
  }
  try {
    const p = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = findUserById(p.sub);
    if (!user) {
      clearAuthCookie(res);
      res.status(401).json({ error: "사용자를 찾을 수 없습니다." });
      return;
    }
    res.json(publicUser(user));
  } catch {
    clearAuthCookie(res);
    res.status(401).json({ error: "세션이 만료되었습니다." });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.post("/api/auth/register", (req, res) => {
  const username = String(req.body?.username ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password ?? "");
  if (username.length < 2) {
    res.status(400).json({ error: "아이디는 2자 이상이어야 합니다." });
    return;
  }
  if (password.length < 4) {
    res.status(400).json({ error: "비밀번호는 4자 이상이어야 합니다." });
    return;
  }
  if (findUserByUsername(username)) {
    res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
    return;
  }
  const id = crypto.randomUUID();
  const password_hash = bcrypt.hashSync(password, 10);
  insertUser({ id, username, password_hash, google_sub: null });
  setAuthCookie(res, id);
  res.status(201).json(publicUser({ id, username }));
});

app.post("/api/auth/login", (req, res) => {
  const username = String(req.body?.username ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password ?? "");
  const user = findUserByUsername(username);
  if (!user) {
    res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    return;
  }
  const hasPw = user.password_hash != null && user.password_hash !== "";
  if (!hasPw && user.google_sub) {
    res.status(401).json({ error: "이 계정은 Google로 로그인해 주세요." });
    return;
  }
  if (!hasPw) {
    res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    return;
  }
  if (!bcrypt.compareSync(password, user.password_hash!)) {
    res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    return;
  }
  setAuthCookie(res, user.id);
  res.json(publicUser(user));
});

app.post("/api/auth/google", async (req, res) => {
  const credential = String(req.body?.credential ?? "");
  if (!credential) {
    res.status(400).json({ error: "Google 인증 정보가 없습니다." });
    return;
  }
  if (!GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: "서버에 GOOGLE_CLIENT_ID가 설정되지 않았습니다." });
    return;
  }
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.trim().toLowerCase();
    const sub = payload?.sub;
    if (!email || !sub) {
      res.status(400).json({ error: "Google 이메일을 확인할 수 없습니다." });
      return;
    }
    if (payload.email_verified === false) {
      res.status(400).json({ error: "인증되지 않은 Google 이메일입니다." });
      return;
    }

    let user = findUserByGoogleSub(sub);
    if (user) {
      setAuthCookie(res, user.id);
      res.json(publicUser(user));
      return;
    }

    user = findUserByUsername(email);
    if (user) {
      if (user.google_sub && user.google_sub !== sub) {
        res.status(409).json({ error: "이 이메일은 다른 Google 계정에 이미 연결되어 있습니다." });
        return;
      }
      if (!user.google_sub) {
        setUserGoogleSub(user.id, sub);
        user = findUserById(user.id)!;
      }
      setAuthCookie(res, user.id);
      res.json(publicUser(user));
      return;
    }

    const id = crypto.randomUUID();
    insertUser({ id, username: email, password_hash: null, google_sub: sub });
    setAuthCookie(res, id);
    res.status(201).json(publicUser({ id, username: email }));
  } catch (e) {
    console.error("Google verify:", e);
    res.status(401).json({ error: "Google 로그인 검증에 실패했습니다." });
  }
});

app.get("/api/projects", requireAuth, (req, res) => {
  const rows = listProjectsByUser(req.userId!);
  res.json(rows.map(rowToProject));
});

app.post("/api/projects", requireAuth, (req, res) => {
  const name = String(req.body?.name ?? "").trim() || "새 프로젝트";
  const id = crypto.randomUUID();
  const updatedAt = new Date().toISOString();
  insertProject({
    id,
    user_id: req.userId!,
    name,
    workspace_json: emptyWorkspaceJson(),
    updated_at: updatedAt,
  });
  const row = getProjectRow(id, req.userId!);
  if (!row) {
    res.status(500).json({ error: "프로젝트 생성 후 조회 실패" });
    return;
  }
  res.status(201).json(rowToProject(row));
});

app.get("/api/projects/:id", requireAuth, (req, res) => {
  const row = getProjectRow(req.params.id, req.userId!);
  if (!row) {
    res.status(404).json({ error: "프로젝트를 찾을 수 없습니다." });
    return;
  }
  res.json(rowToProject(row));
});

app.patch("/api/projects/:id", requireAuth, (req, res) => {
  const workspace = req.body?.workspace;
  if (workspace == null) {
    res.status(400).json({ error: "workspace가 필요합니다." });
    return;
  }
  let json: string;
  try {
    json = JSON.stringify(workspace);
  } catch {
    res.status(400).json({ error: "workspace 직렬화 실패" });
    return;
  }
  const updatedAt = new Date().toISOString();
  const r = updateProjectWorkspaceRow(req.params.id, req.userId!, json, updatedAt);
  if (r.changes === 0) {
    res.status(404).json({ error: "프로젝트를 찾을 수 없습니다." });
    return;
  }
  res.json({ ok: true, updatedAt });
});

app.delete("/api/projects/:id", requireAuth, (req, res) => {
  const r = deleteProjectRow(req.params.id, req.userId!);
  if (r.changes === 0) {
    res.status(404).json({ error: "프로젝트를 찾을 수 없습니다." });
    return;
  }
  res.json({ ok: true });
});

/** TC 생성: GEMINI_API_KEY 있으면 Gemini, 아니면 TC_GENERATE_UPSTREAM_URL 프록시 */
app.post("/api/generate-tc", requireAuth, async (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const out = await generateTcWithGemini({
        systemPrompt: String(req.body?.systemPrompt ?? ""),
        prd: String(req.body?.prd ?? ""),
        tabGroups: Array.isArray(req.body?.tabGroups) ? req.body.tabGroups : [],
      });
      res.json(out);
    } catch (e) {
      console.error("generate-tc gemini:", e);
      res.status(502).json({
        error: e instanceof Error ? e.message : "Gemini TC 생성 실패",
      });
    }
    return;
  }

  const upstream = process.env.TC_GENERATE_UPSTREAM_URL?.replace(/\/$/, "");
  if (!upstream) {
    res.status(503).json({
      error:
        "TC 생성 미설정입니다. .env에 GEMINI_API_KEY를 넣거나 TC_GENERATE_UPSTREAM_URL을 설정하세요. 목업만 쓰려면 클라이언트 VITE_USE_MOCK=true",
    });
    return;
  }
  try {
    const r = await fetch(`${upstream}/generate-tc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const text = await r.text();
    res.status(r.status).type(r.headers.get("content-type") ?? "application/json").send(text);
  } catch (e) {
    console.error("generate-tc proxy:", e);
    res.status(502).json({ error: "TC 생성 업스트림 요청 실패" });
  }
});

app.listen(PORT, () => {
  const gemini = process.env.GEMINI_API_KEY?.trim() ? `Gemini(${process.env.GEMINI_MODEL ?? "gemini-2.0-flash"})` : "Gemini(off)";
  console.log(`API + DB 서버 http://127.0.0.1:${PORT}  (DB: SQLite, TC: ${gemini})`);
});
