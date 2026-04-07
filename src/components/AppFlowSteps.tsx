import React from "react";

export type AppFlowStep = "login" | "projects" | "prd" | "tc";

const STEPS: { key: AppFlowStep; label: string }[] = [
  { key: "login", label: "로그인" },
  { key: "projects", label: "프로젝트" },
  { key: "prd", label: "PRD·Figma" },
  { key: "tc", label: "TC 자동 생성" },
];

export interface AppFlowStepsProps {
  active: AppFlowStep;
}

export const AppFlowSteps: React.FC<AppFlowStepsProps> = ({ active }) => {
  const idx = STEPS.findIndex((s) => s.key === active);
  return (
    <ol className="app-flow-steps" aria-label="작업 흐름">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <li
            key={s.key}
            className={`app-flow-steps__item${done ? " app-flow-steps__item--done" : ""}${
              current ? " app-flow-steps__item--current" : ""
            }`}
          >
            <span className="app-flow-steps__num">{done ? "✓" : i + 1}</span>
            <span className="app-flow-steps__label">{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
};
