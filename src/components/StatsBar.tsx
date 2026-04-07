import React, { useMemo } from "react";
import { PRIORITY_COLORS } from "../constants";
import type { Priority, Sheet } from "../types";
import { Badge } from "./Badge";

export interface StatsBarProps {
  sheets: Sheet[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ sheets }) => {
  const stats = useMemo(() => {
    let total = 0;
    const byPri: Record<Priority, number> = { P1: 0, P2: 0, P3: 0, P4: 0 };
    const results = { PASS: 0, FAIL: 0, NA: 0, BLOCK: 0, empty: 0 };
    for (const s of sheets) {
      for (const tc of s.testCases) {
        total += 1;
        byPri[tc.priority] += 1;
        if (tc.result === "") results.empty += 1;
        else if (tc.result === "PASS") results.PASS += 1;
        else if (tc.result === "FAIL") results.FAIL += 1;
        else if (tc.result === "NA") results.NA += 1;
        else if (tc.result === "BLOCK") results.BLOCK += 1;
      }
    }
    return { total, byPri, results };
  }, [sheets]);

  if (stats.total === 0) {
    return <div className="stats-bar stats-bar--empty">시트에 TC가 없습니다.</div>;
  }

  return (
    <div className="stats-bar">
      <span className="stats-bar__item">
        <strong>{stats.total}</strong> 건
      </span>
      {(["P1", "P2", "P3", "P4"] as const).map((p) => (
        <span key={p} className="stats-bar__item stats-bar__item--badge">
          <Badge label={`${p} ${stats.byPri[p]}`} colors={PRIORITY_COLORS[p]} />
        </span>
      ))}
      <span className="stats-bar__divider" />
      <span className="stats-bar__item muted">결과: PASS {stats.results.PASS}</span>
      <span className="stats-bar__item muted">FAIL {stats.results.FAIL}</span>
      <span className="stats-bar__item muted">NA {stats.results.NA}</span>
      <span className="stats-bar__item muted">BLOCK {stats.results.BLOCK}</span>
      <span className="stats-bar__item muted">미입력 {stats.results.empty}</span>
    </div>
  );
};
