import type { ClaudeTC, ImageFile, Priority, Sheet, TestCase } from "../types";

export const createEmptyTC = (): TestCase => ({
  id: Date.now() + Math.random(),
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
});

export const createEmptySheet = (name: string): Sheet => ({
  name,
  testCases: [createEmptyTC()],
});

const isPriority = (v: string): v is Priority =>
  v === "P1" || v === "P2" || v === "P3" || v === "P4";

export const mapClaudeTcToTestCase = (tc: ClaudeTC, salt: number): TestCase => ({
  id: Date.now() + salt + Math.random(),
  priority: isPriority(tc.priority) ? tc.priority : "P2",
  depth1: tc.depth1 ?? "",
  depth2: tc.depth2 ?? "",
  depth3: tc.depth3 ?? "",
  depth4: tc.depth4 ?? "",
  preCondition: tc.preCondition ?? "",
  testStep: tc.testStep ?? "",
  expectedResult: tc.expectedResult ?? "",
  result: "",
  tester: "",
  note: "",
});

export const readFileAsImageFile = (file: File): Promise<ImageFile> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === "string" ? reader.result : "";
      resolve({
        data,
        type: file.type || "application/octet-stream",
        name: file.name,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
