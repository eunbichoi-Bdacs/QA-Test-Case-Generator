import React from "react";
import { DesignTabGroupsPanel } from "../components/input/DesignTabGroupsPanel";
import { PrdSection } from "../components/input/PrdSection";
import type { TabGroup } from "../types";

export interface InputScreenProps {
  prd: string;
  onPrdChange: (v: string) => void;
  tabGroups: TabGroup[];
  onTabGroupsChange: (g: TabGroup[]) => void;
  activeDesignTabIndex: number;
  onActiveDesignTabIndex: (i: number) => void;
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  prd,
  onPrdChange,
  tabGroups,
  onTabGroupsChange,
  activeDesignTabIndex,
  onActiveDesignTabIndex,
  onGenerate,
  loading,
  error,
}) => (
  <div className="screen screen--input">
    <PrdSection value={prd} onChange={onPrdChange} />
    <DesignTabGroupsPanel
      tabGroups={tabGroups}
      activeGroupIndex={activeDesignTabIndex}
      onActiveGroupIndex={onActiveDesignTabIndex}
      onUpdateTabGroups={onTabGroupsChange}
    />
    <div className="input-actions">
      {error && <p className="input-actions__error">{error}</p>}
      <button
        type="button"
        className="btn btn--primary btn--large"
        onClick={onGenerate}
        disabled={loading || !prd.trim()}
      >
        {loading ? "생성 중…" : "테스트 케이스 생성"}
      </button>
      {!import.meta.env.VITE_TC_API_URL && import.meta.env.VITE_USE_MOCK !== "true" && (
        <p className="input-actions__hint muted">
          API URL이 없습니다. 루트에 <code>.env</code> 파일을 만들고{" "}
          <code>VITE_USE_MOCK=true</code> 또는 <code>VITE_TC_API_URL</code>을 설정하세요.
        </p>
      )}
    </div>
  </div>
);
