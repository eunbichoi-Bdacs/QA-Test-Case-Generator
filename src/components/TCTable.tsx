import React from "react";
import {
  PRIORITIES,
  PRIORITY_COLORS,
  PRIORITY_DESC,
  RESULTS,
  RESULT_COLORS,
  TESTERS,
} from "../constants";
import type { Priority, Result, Sheet, TestCase } from "../types";
import { createEmptyTC } from "../utils/testCase";
import { Badge } from "./Badge";

export interface TCTableProps {
  sheet: Sheet;
  sheetIndex: number;
  onUpdate: (sheetIndex: number, next: Sheet) => void;
}

export const TCTable: React.FC<TCTableProps> = ({ sheet, sheetIndex, onUpdate }) => {
  const patchSheet = (mutate: (draft: TestCase[]) => void): void => {
    const nextCases = [...sheet.testCases];
    mutate(nextCases);
    onUpdate(sheetIndex, { ...sheet, testCases: nextCases });
  };

  const patchTc = (row: number, patch: Partial<TestCase>): void => {
    patchSheet((cases) => {
      cases[row] = { ...cases[row], ...patch };
    });
  };

  const setSheetName = (name: string): void => {
    onUpdate(sheetIndex, { ...sheet, name });
  };

  const addRow = (): void => {
    patchSheet((cases) => {
      cases.push(createEmptyTC());
    });
  };

  const removeRow = (row: number): void => {
    if (sheet.testCases.length <= 1) return;
    patchSheet((cases) => {
      cases.splice(row, 1);
    });
  };

  return (
    <section className="tc-table-wrap">
      <div className="tc-table-wrap__head">
        <label className="tc-sheet-name">
          <span className="tc-sheet-name__label">시트명</span>
          <input
            type="text"
            className="tc-sheet-name__input"
            value={sheet.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSheetName(e.target.value)}
            placeholder="예: Admin · 청구서 관리"
          />
        </label>
        <button type="button" className="btn btn--secondary" onClick={addRow}>
          행 추가
        </button>
      </div>

      <div className="tc-table-scroll">
        <table className="tc-table">
          <thead>
            <tr>
              <th className="tc-table__th--narrow">P</th>
              <th>1D</th>
              <th>2D</th>
              <th>3D</th>
              <th>4D</th>
              <th>사전조건</th>
              <th>재현절차</th>
              <th>기대결과</th>
              <th>결과</th>
              <th>테스터</th>
              <th>비고</th>
              <th className="tc-table__th--narrow" />
            </tr>
          </thead>
          <tbody>
            {sheet.testCases.map((tc, row) => (
              <tr key={tc.id}>
                <td>
                  <select
                    className="tc-select tc-select--pri"
                    value={tc.priority}
                    title={PRIORITY_DESC[tc.priority]}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const v = e.target.value as Priority;
                      patchTc(row, { priority: v });
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="tc-pri-badge">
                    <Badge label={tc.priority} colors={PRIORITY_COLORS[tc.priority]} />
                  </div>
                </td>
                <td>
                  <input
                    className="tc-input"
                    value={tc.depth1}
                    onChange={(e) => patchTc(row, { depth1: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="tc-input"
                    value={tc.depth2}
                    onChange={(e) => patchTc(row, { depth2: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="tc-input"
                    value={tc.depth3}
                    onChange={(e) => patchTc(row, { depth3: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="tc-input"
                    value={tc.depth4}
                    onChange={(e) => patchTc(row, { depth4: e.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    className="tc-textarea"
                    rows={2}
                    value={tc.preCondition}
                    onChange={(e) => patchTc(row, { preCondition: e.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    className="tc-textarea"
                    rows={3}
                    value={tc.testStep}
                    onChange={(e) => patchTc(row, { testStep: e.target.value })}
                  />
                </td>
                <td>
                  <textarea
                    className="tc-textarea"
                    rows={3}
                    value={tc.expectedResult}
                    onChange={(e) => patchTc(row, { expectedResult: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    className="tc-select"
                    value={tc.result}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      patchTc(row, { result: e.target.value as Result });
                    }}
                    style={
                      tc.result && RESULT_COLORS[tc.result]
                        ? {
                            background: RESULT_COLORS[tc.result].bg,
                            color: RESULT_COLORS[tc.result].color,
                          }
                        : undefined
                    }
                  >
                    {RESULTS.map((r) => (
                      <option key={r || "empty"} value={r}>
                        {r === "" ? "—" : r}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="tc-select"
                    value={tc.tester}
                    onChange={(e) => patchTc(row, { tester: e.target.value })}
                  >
                    <option value="">—</option>
                    {TESTERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="tc-input"
                    value={tc.note}
                    onChange={(e) => patchTc(row, { note: e.target.value })}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    onClick={() => removeRow(row)}
                    disabled={sheet.testCases.length <= 1}
                    title="행 삭제"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
