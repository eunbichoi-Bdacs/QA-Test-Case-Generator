import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const dataDir = path.join(rootDir, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, "app.db");
export const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  workspace_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
`);

export interface UserRow {
  id: string;
  username: string;
  password_hash: string | null;
  google_sub: string | null;
  created_at: number;
}

export function insertUser(row: {
  id: string;
  username: string;
  password_hash: string | null;
  google_sub: string | null;
}): void {
  db.prepare(
    `INSERT INTO users (id, username, password_hash, google_sub, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(row.id, row.username, row.password_hash, row.google_sub, Date.now());
}

export function findUserByUsername(username: string): UserRow | undefined {
  return db
    .prepare(`SELECT * FROM users WHERE lower(username) = lower(?)`)
    .get(username) as UserRow | undefined;
}

export function findUserById(id: string): UserRow | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
}

export function findUserByGoogleSub(googleSub: string): UserRow | undefined {
  return db.prepare(`SELECT * FROM users WHERE google_sub = ?`).get(googleSub) as UserRow | undefined;
}

export function setUserGoogleSub(userId: string, googleSub: string): void {
  db.prepare(`UPDATE users SET google_sub = ? WHERE id = ?`).run(googleSub, userId);
}

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  workspace_json: string;
  updated_at: string;
}

export function insertProject(row: {
  id: string;
  user_id: string;
  name: string;
  workspace_json: string;
  updated_at: string;
}): void {
  db.prepare(
    `INSERT INTO projects (id, user_id, name, workspace_json, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(row.id, row.user_id, row.name, row.workspace_json, row.updated_at);
}

export function listProjectsByUser(userId: string): ProjectRow[] {
  return db
    .prepare(`SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC`)
    .all(userId) as ProjectRow[];
}

export function getProjectRow(id: string, userId: string): ProjectRow | undefined {
  return db
    .prepare(`SELECT * FROM projects WHERE id = ? AND user_id = ?`)
    .get(id, userId) as ProjectRow | undefined;
}

export function updateProjectWorkspaceRow(
  id: string,
  userId: string,
  workspaceJson: string,
  updatedAt: string
): { changes: number } {
  return db
    .prepare(`UPDATE projects SET workspace_json = ?, updated_at = ? WHERE id = ? AND user_id = ?`)
    .run(workspaceJson, updatedAt, id, userId) as { changes: number };
}

export function deleteProjectRow(id: string, userId: string): { changes: number } {
  return db.prepare(`DELETE FROM projects WHERE id = ? AND user_id = ?`).run(id, userId) as {
    changes: number;
  };
}
