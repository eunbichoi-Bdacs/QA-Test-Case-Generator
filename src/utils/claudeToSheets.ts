import type { ClaudeResponse, Sheet } from "../types";
import { createEmptySheet, mapClaudeTcToTestCase } from "./testCase";

export const sheetsFromClaudeResponse = (data: ClaudeResponse): Sheet[] => {
  if (!data.sheets?.length) {
    return [createEmptySheet("시트 1")];
  }
  return data.sheets.map((s, si) => ({
    name: s.name?.trim() || `시트 ${si + 1}`,
    testCases: (s.testCases ?? []).map((tc, ti) => mapClaudeTcToTestCase(tc, si * 10_000 + ti)),
  }));
};
