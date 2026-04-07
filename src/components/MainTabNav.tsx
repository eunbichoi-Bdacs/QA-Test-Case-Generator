import React from "react";
import type { MainAppTab } from "../types";

export interface MainTabNavProps {
  active: MainAppTab;
  onChange: (tab: MainAppTab) => void;
}

export const MainTabNav: React.FC<MainTabNavProps> = ({ active, onChange }) => (
  <nav className="main-tab-nav" aria-label="주요 화면">
    <button
      type="button"
      className={`main-tab-nav__btn${active === "input" ? " main-tab-nav__btn--active" : ""}`}
      onClick={() => onChange("input")}
    >
      PRD · Figma
    </button>
    <button
      type="button"
      className={`main-tab-nav__btn${active === "results" ? " main-tab-nav__btn--active" : ""}`}
      onClick={() => onChange("results")}
    >
      테스트 케이스
    </button>
  </nav>
);
