import React from "react";

export interface PrdSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const PrdSection: React.FC<PrdSectionProps> = ({ value, onChange }) => (
  <section className="prd-section">
    <h2 className="section-title">PRD</h2>
    <p className="section-hint">
      제품 요구사항 문서를 붙여 넣으세요. Figma 화면은 아래 탭별로 이미지를 업로드합니다.
    </p>
    <textarea
      className="prd-textarea"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      placeholder="PRD 본문…"
      spellCheck={false}
    />
  </section>
);
