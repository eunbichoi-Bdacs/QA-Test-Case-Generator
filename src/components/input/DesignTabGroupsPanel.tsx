import React, { useRef } from "react";
import type { TabGroup } from "../../types";
import { readFileAsImageFile } from "../../utils/testCase";

export interface DesignTabGroupsPanelProps {
  tabGroups: TabGroup[];
  activeGroupIndex: number;
  onActiveGroupIndex: (index: number) => void;
  onUpdateTabGroups: (next: TabGroup[]) => void;
}

export const DesignTabGroupsPanel: React.FC<DesignTabGroupsPanelProps> = ({
  tabGroups,
  activeGroupIndex,
  onActiveGroupIndex,
  onUpdateTabGroups,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const safeActive = Math.min(activeGroupIndex, Math.max(0, tabGroups.length - 1));
  const group = tabGroups[safeActive];

  const setGroups = (updater: (g: TabGroup[]) => TabGroup[]): void => {
    onUpdateTabGroups(updater([...tabGroups]));
  };

  const addGroup = (): void => {
    const next = [...tabGroups, { name: `Figma 화면 ${tabGroups.length + 1}`, images: [] }];
    onUpdateTabGroups(next);
    onActiveGroupIndex(next.length - 1);
  };

  const removeGroup = (index: number): void => {
    if (tabGroups.length <= 1) return;
    const next = tabGroups.filter((_, i) => i !== index);
    onUpdateTabGroups(next);
    let ni = safeActive;
    if (index === safeActive) ni = Math.max(0, safeActive - 1);
    else if (index < safeActive) ni = safeActive - 1;
    onActiveGroupIndex(Math.min(ni, next.length - 1));
  };

  const renameGroup = (index: number, name: string): void => {
    setGroups((g) => g.map((gr, i) => (i === index ? { ...gr, name } : gr)));
  };

  const onPickFiles = (): void => {
    fileRef.current?.click();
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files?.length) return;
    const additions = await Promise.all(Array.from(files).map(readFileAsImageFile));
    setGroups((g) =>
      g.map((gr, i) =>
        i === safeActive ? { ...gr, images: [...gr.images, ...additions] } : gr
      )
    );
    e.target.value = "";
  };

  const removeImage = (gi: number, ii: number): void => {
    setGroups((g) =>
      g.map((gr, i) =>
        i === gi ? { ...gr, images: gr.images.filter((_, j) => j !== ii) } : gr
      )
    );
  };

  return (
    <section className="design-tabs-section">
      <div className="design-tabs-section__head">
        <h2 className="section-title">Figma (화면별 탭)</h2>
        <div className="design-tabs-section__actions">
          <button type="button" className="btn btn--secondary" onClick={addGroup}>
            화면 탭 추가
          </button>
        </div>
      </div>
      <p className="section-hint">
        Figma에서 프레임 보내기(Export)로 PNG/JPEG를 저장하거나 스크린샷을 캡처해, Admin·Client 등
        화면별 탭에 넣으면 시트 분리에 반영하기 쉽습니다.
      </p>

      <div className="design-subtabs" role="tablist" aria-label="Figma 화면별 탭">
        {tabGroups.map((g, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === safeActive}
            className={`design-subtabs__btn${i === safeActive ? " design-subtabs__btn--active" : ""}`}
            onClick={() => onActiveGroupIndex(i)}
          >
            {g.name || `탭 ${i + 1}`}
          </button>
        ))}
      </div>

      {group && (
        <div className="design-panel" role="tabpanel">
          <div className="design-panel__row">
            <label className="design-panel__label">
              탭 이름 (시트명 힌트)
              <input
                type="text"
                className="tc-input design-panel__name-input"
                value={group.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  renameGroup(safeActive, e.target.value)
                }
              />
            </label>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => removeGroup(safeActive)}
              disabled={tabGroups.length <= 1}
            >
              이 탭 삭제
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="visually-hidden"
              onChange={(e) => void onFiles(e)}
            />
            <button type="button" className="btn btn--primary" onClick={onPickFiles}>
              Figma 이미지 추가
            </button>
          </div>

          {group.images.length === 0 ? (
            <div className="design-panel__empty">이 탭에 Figma 화면 이미지를 추가하세요.</div>
          ) : (
            <ul className="design-thumbs">
              {group.images.map((img, ii) => (
                <li key={`${img.name}-${ii}`} className="design-thumbs__item">
                  <img src={img.data} alt={img.name} className="design-thumbs__img" />
                  <span className="design-thumbs__caption">{img.name}</span>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small design-thumbs__remove"
                    onClick={() => removeImage(safeActive, ii)}
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
