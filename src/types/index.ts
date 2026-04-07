export type Priority = "P1" | "P2" | "P3" | "P4";
export type Result = "" | "PASS" | "FAIL" | "NA" | "BLOCK";

export interface TestCase {
  id: number;
  priority: Priority;
  depth1: string;
  depth2: string;
  depth3: string;
  depth4: string;
  preCondition: string;
  testStep: string;
  expectedResult: string;
  result: Result;
  tester: string;
  note: string;
}

export interface Sheet {
  name: string;
  testCases: TestCase[];
}

export interface ImageFile {
  data: string;
  type: string;
  name: string;
}

/** Figma 화면 이미지를 탭 단위로 묶은 그룹 — 시트명 후보로 API에 전달 */
export interface TabGroup {
  name: string;
  images: ImageFile[];
}

export interface ColorSet {
  bg: string;
  color: string;
  border?: string;
}

export interface ClaudeTC {
  priority: Priority;
  depth1: string;
  depth2: string;
  depth3: string;
  depth4: string;
  preCondition: string;
  testStep: string;
  expectedResult: string;
}

export interface ClaudeResponse {
  sheets?: {
    name: string;
    testCases: ClaudeTC[];
  }[];
  errors?: string[];
}

export type MainAppTab = "input" | "results";

/** 프로젝트 작업 공간 (DB `workspace_json`과 동일 구조) */
export interface ProjectWorkspace {
  prd: string;
  tabGroups: TabGroup[];
  activeDesignTabIndex: number;
  sheets: Sheet[];
  policyNotes: string[];
  mainTab: MainAppTab;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  name: string;
  updatedAt: string;
  workspace: ProjectWorkspace;
}

export interface AuthUser {
  id: string;
  username: string;
}
