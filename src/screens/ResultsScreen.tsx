import React, { useState } from "react";
import { StatsBar } from "../components/StatsBar";
import { TCTable } from "../components/TCTable";
import type { Sheet } from "../types";
import { createEmptySheet } from "../utils/testCase";
import { exportSheetsToXlsx } from "../utils/excelExport";
import { parseClaudeJson } from "../utils/parseClaudeJson";
import { sheetsFromClaudeResponse } from "../utils/claudeToSheets";

export interface ResultsScreenProps {
  sheets: Sheet[];
  onSheetsChange: (s: Sheet[]) => void;
  policyNotes: string[];
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  sheets,
  onSheetsChange,
  policyNotes,
}) => {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  const updateSheet = (sheetIndex: number, next: Sheet): void => {
    onSheetsChange(sheets.map((s, i) => (i === sheetIndex ? next : s)));
  };

  const addSheet = (): void => {
    onSheetsChange([...sheets, createEmptySheet(`시트 ${sheets.length + 1}`)]);
  };

  const removeSheet = (index: number): void => {
    if (sheets.length <= 1) return;
    onSheetsChange(sheets.filter((_, i) => i !== index));
  };

  const applyPaste = (): void => {
    setPasteError(null);
    try {
      const data = parseClaudeJson(pasteText);
      onSheetsChange(sheetsFromClaudeResponse(data));
      setPasteOpen(false);
      setPasteText("");
    } catch (e) {
      setPasteError(e instanceof Error ? e.message : "JSON 파싱 실패");
    }
  };

  const exportFile = (): void => {
    const stamp = new Date().toISOString().slice(0, 10);
    exportSheetsToXlsx(sheets, `tc-export-${stamp}`);
  };

  return (
    <div className="screen screen--results">
      <div className="results-toolbar">
        <StatsBar sheets={sheets} />
        <div className="results-toolbar__btns">
          <button type="button" className="btn btn--secondary" onClick={() => setPasteOpen((o) => !o)}>
            JSON 붙여넣기
          </button>
          <button type="button" className="btn btn--secondary" onClick={addSheet}>
            빈 시트 추가
          </button>
          <button type="button" className="btn btn--primary" onClick={exportFile}>
            Excel 다운로드
          </button>
        </div>
      </div>

      {pasteOpen && (
        <div className="paste-panel">
          <p className="section-hint">API 응답 JSON 전체를 붙여 넣으면 시트를 덮어씁니다.</p>
          <textarea
            className="paste-panel__textarea"
            value={pasteText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPasteText(e.target.value)}
            placeholder='{ "sheets": [ ... ], "errors": [] }'
            spellCheck={false}
            rows={8}
          />
          {pasteError && <p className="input-actions__error">{pasteError}</p>}
          <button type="button" className="btn btn--primary" onClick={applyPaste}>
            적용
          </button>
        </div>
      )}

      {policyNotes.length > 0 && (
        <aside className="policy-notes">
          <h3 className="policy-notes__title">정책·확인 메모</h3>
          <ul>
            {policyNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </aside>
      )}

      <div className="sheets-stack">
        {sheets.map((sheet, sheetIndex) => (
          <div key={`${sheet.name}-${sheetIndex}`} className="sheet-card">
            <div className="sheet-card__bar">
              <span className="sheet-card__label">
                시트 {sheetIndex + 1} · {sheet.testCases.length}건
              </span>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => removeSheet(sheetIndex)}
                disabled={sheets.length <= 1}
              >
                시트 삭제
              </button>
            </div>
            <TCTable
              sheet={sheet}
              sheetIndex={sheetIndex}
              onUpdate={updateSheet}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
