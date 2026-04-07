/**
 * Google Gemini로 TC JSON 생성 (서버 전용, API 키는 환경 변수)
 * @see https://ai.google.dev/gemini-api/docs
 */

type TabImage = { data: string; type: string; name: string };
type TabGroupIn = { name: string; images: TabImage[] };

export interface GenerateTcBody {
  systemPrompt: string;
  prd: string;
  tabGroups: TabGroupIn[];
}

export interface TcJsonOut {
  sheets?: { name: string; testCases: Record<string, unknown>[] }[];
  errors?: string[];
}

function stripBase64FromDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (m) {
    return { mimeType: m[1] || "image/png", data: m[2].replace(/\s/g, "") };
  }
  return { mimeType: "image/png", data: dataUrl.replace(/\s/g, "") };
}

function extractJsonObject(text: string): string {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return t;
}

export async function generateTcWithGemini(body: GenerateTcBody): Promise<TcJsonOut> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY가 없습니다.");

  const model = (process.env.GEMINI_MODEL ?? "gemini-2.0-flash").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  let imageIndex = 0;
  const tabLines: string[] = [];
  for (const g of body.tabGroups ?? []) {
    const n = g.images?.length ?? 0;
    tabLines.push(`- "${g.name || "탭"}": 이미지 ${n}장 (아래 순서대로 ${imageIndex + 1}번째~${imageIndex + n}번째)`);
    imageIndex += n;
  }

  parts.push({
    text: [
      "아래 PRD와 순서대로 첨부된 Figma/화면 이미지를 읽고, 시스템 지시에 맞는 **JSON 한 덩어리만** 출력하세요.",
      "",
      "## PRD",
      body.prd || "(비어 있음)",
      "",
      "## 탭·이미지 순서",
      tabLines.length ? tabLines.join("\n") : "(이미지 없음)",
    ].join("\n"),
  });

  for (const g of body.tabGroups ?? []) {
    parts.push({ text: `\n[탭: ${g.name || "이름 없음"}]\n` });
    for (const img of g.images ?? []) {
      const { mimeType, data } = stripBase64FromDataUrl(img.data);
      parts.push({
        inlineData: {
          mimeType: img.type?.startsWith("image/") ? img.type : mimeType,
          data,
        },
      });
    }
  }

  const reqBody = {
    systemInstruction: {
      parts: [{ text: body.systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.25,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqBody),
  });

  const rawText = await res.text();
  if (!res.ok) {
    let msg = rawText.slice(0, 500);
    try {
      const j = JSON.parse(rawText) as { error?: { message?: string } };
      if (j.error?.message) msg = j.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(`Gemini API 오류 (${res.status}): ${msg}`);
  }

  let parsed: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
    promptFeedback?: { blockReason?: string };
  };
  try {
    parsed = JSON.parse(rawText) as typeof parsed;
  } catch {
    throw new Error("Gemini 응답 JSON 파싱 실패");
  }

  if (parsed.promptFeedback?.blockReason) {
    throw new Error(`Gemini 요청 차단: ${parsed.promptFeedback.blockReason}`);
  }

  const cand = parsed.candidates?.[0];
  const reason = cand?.finishReason;
  if (reason && reason !== "STOP" && reason !== "MAX_TOKENS") {
    throw new Error(`Gemini 생성 중단: ${reason}`);
  }

  const text =
    cand?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (!text.trim()) {
    throw new Error("Gemini가 빈 응답을 반환했습니다.");
  }

  let out: TcJsonOut;
  try {
    out = JSON.parse(extractJsonObject(text)) as TcJsonOut;
  } catch (e) {
    throw new Error(
      `모델 JSON 파싱 실패: ${e instanceof Error ? e.message : String(e)}. 원문 앞부분: ${text.slice(0, 200)}`
    );
  }

  if (!out.sheets && !out.errors) {
    throw new Error("응답에 sheets 또는 errors가 없습니다.");
  }

  return out;
}
