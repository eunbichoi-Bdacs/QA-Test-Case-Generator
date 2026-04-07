import type { ColorSet, Priority, Result } from "../types";

export const TESTERS: string[] = ["홍재우", "박건태", "최은비", "최재영"];
export const RESULTS: Result[] = ["", "PASS", "FAIL", "NA", "BLOCK"];
export const PRIORITIES: Priority[] = ["P1", "P2", "P3", "P4"];

export const PRIORITY_DESC: Record<Priority, string> = {
  P1: "핵심 기능 (입/출금, 보안) - 최우선 수행",
  P2: "중요 기능 - P1보다 낮은 우선순위",
  P3: "마이너 기능/UI/UX - 서비스 운영에 큰 문제 없음",
  P4: "옵션 - 유추 케이스 (기획/UX 확인 필요)",
};

export const PRIORITY_COLORS: Record<Priority, ColorSet> = {
  P1: { bg: "#FCEBEB", color: "#A32D2D", border: "#F09595" },
  P2: { bg: "#FAEEDA", color: "#854F0B", border: "#FAC775" },
  P3: { bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" },
  P4: { bg: "#F1EFE8", color: "#5F5E5A", border: "#B4B2A9" },
};

export const RESULT_COLORS: Record<string, ColorSet> = {
  PASS: { bg: "#EAF3DE", color: "#3B6D11" },
  FAIL: { bg: "#FCEBEB", color: "#A32D2D" },
  NA: { bg: "#F1EFE8", color: "#5F5E5A" },
  BLOCK: { bg: "#EEEDFE", color: "#534AB7" },
};

export { SYSTEM_PROMPT } from "./systemPrompt";
