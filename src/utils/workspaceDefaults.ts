import type { ProjectWorkspace, TabGroup } from "../types";
import { createEmptySheet } from "./testCase";

const defaultTabGroups = (): TabGroup[] => [{ name: "Figma 화면 1", images: [] }];

export const emptyWorkspace = (): ProjectWorkspace => ({
  prd: "",
  tabGroups: defaultTabGroups(),
  activeDesignTabIndex: 0,
  sheets: [createEmptySheet("시트 1")],
  policyNotes: [],
  mainTab: "input",
});
