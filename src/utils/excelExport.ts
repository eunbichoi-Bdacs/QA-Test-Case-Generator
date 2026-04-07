import * as XLSX from "xlsx";
import type { Sheet } from "../types";

const safeSheetName = (name: string, index: number): string => {
  const base = name.replace(/[\\/?*[\]]/g, "_").slice(0, 28) || `Sheet${index + 1}`;
  return base.length > 31 ? base.slice(0, 31) : base;
};

export const exportSheetsToXlsx = (sheets: Sheet[], filename: string): void => {
  const wb = XLSX.utils.book_new();
  sheets.forEach((sheet, i) => {
    const rows = sheet.testCases.map((tc) => ({
      Priority: tc.priority,
      "1Depth": tc.depth1,
      "2Depth": tc.depth2,
      "3Depth": tc.depth3,
      "4Depth": tc.depth4,
      "Pre-Condition": tc.preCondition,
      "Test Step": tc.testStep,
      "Expected Result": tc.expectedResult,
      Result: tc.result || "-",
      Tester: tc.tester,
      Note: tc.note,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName(sheet.name, i));
  });
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
};
