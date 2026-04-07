/** 서버에서 빈 프로젝트 workspace JSON 생성 (프론트 emptyWorkspace와 동일 구조) */
export function emptyWorkspaceJson(): string {
  const w = {
    prd: "",
    tabGroups: [{ name: "Figma 화면 1", images: [] }],
    activeDesignTabIndex: 0,
    sheets: [
      {
        name: "시트 1",
        testCases: [
          {
            id: Date.now(),
            priority: "P2",
            depth1: "",
            depth2: "",
            depth3: "",
            depth4: "",
            preCondition: "",
            testStep: "",
            expectedResult: "",
            result: "",
            tester: "",
            note: "",
          },
        ],
      },
    ],
    policyNotes: [],
    mainTab: "input",
  };
  return JSON.stringify(w);
}
