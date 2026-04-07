import type { ClaudeResponse } from "../types";

/** API 없이 UI만 볼 때 `.env`에 VITE_USE_MOCK=true */
export const getMockClaudeResponse = (tabGroupNames: string[]): ClaudeResponse => {
  const sheets = tabGroupNames.map((name, gi) => ({
    name: name || `시트 ${gi + 1}`,
    testCases: [
      {
        priority: "P1" as const,
        depth1: "샘플 메뉴",
        depth2: "샘플 화면",
        depth3: "핵심 기능",
        depth4: "정상 등록",
        preCondition: "로그인 완료, 필수 데이터 존재",
        testStep: "1. 메뉴 진입\n2. 필수값 입력\n3. 저장 클릭",
        expectedResult: "1. 저장 성공 토스트\n2. 목록에 반영",
      },
      {
        priority: "P2" as const,
        depth1: "샘플 메뉴",
        depth2: "샘플 화면",
        depth3: "유효성",
        depth4: "필수값 미입력",
        preCondition: "동일 화면",
        testStep: "1. 필수 필드 비운 채 저장",
        expectedResult: "필드별 에러 메시지 표시, 저장 요청 없음",
      },
    ],
  }));

  return { sheets, errors: ["(목 데이터) 실제 생성은 API 연동 후 사용하세요."] };
};
