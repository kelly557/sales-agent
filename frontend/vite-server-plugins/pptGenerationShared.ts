import type { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs";

const qwenApiUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export interface ProposalPptPayload {
  projectName?: unknown;
  customer?: unknown;
  location?: unknown;
  scenario?: unknown;
  area?: unknown;
  baseCondition?: unknown;
  demand?: unknown;
  coatingSystem?: unknown;
  template?: unknown;
  language?: unknown;
  slides?: unknown;
  knowledge?: unknown;
  rules?: unknown;
  citations?: unknown;
  approvals?: unknown;
  modelSlides?: unknown;
}

export interface ProposalPptJobState {
  id: string;
  outputPath: string;
  logPath: string;
  status: "running" | "done" | "error";
  downloadUrl?: string;
  error?: string;
  stage?: string;
  progress?: number;
  startedAt: number;
}

export function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function appendLog(filePath: string, line: string) {
  fs.appendFileSync(filePath, `${line}\n`, "utf8");
}

export function readTail(filePath: string, lineCount: number): string {
  try {
    if (!fs.existsSync(filePath)) return "";
    const content = fs.readFileSync(filePath, "utf8");
    return content.split(/\r?\n/).slice(-lineCount).join("\n");
  } catch {
    return "";
  }
}

export function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let rawBody = "";
    req.on("data", (chunk: Buffer) => {
      rawBody += chunk.toString("utf8");
    });
    req.on("end", () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch {
        reject(new Error("请求体不是有效 JSON"));
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function parseModelJson(content: unknown): { slides?: unknown } | null {
  if (typeof content !== "string") return null;
  const normalized = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(normalized);
  } catch {
    const match = normalized.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export function parsePptLog(log: string, job?: ProposalPptJobState) {
  const lines = log.split(/\r?\n/).filter(Boolean);
  const doneLine = [...lines].reverse().find((line) => line.includes("[DONE]"));
  const errorLine = [...lines].reverse().find((line) => line.includes("[ERROR]"));
  const progressLine = [...lines]
    .reverse()
    .find((line) => line.includes("[PROGRESS]") || line.includes("[PING]"));
  const phaseLine = [...lines].reverse().find((line) => line.includes("[PHASE]"));
  const downloadMatch = doneLine?.match(/download_url=(\S+)/);
  const progressMatch = progressLine?.match(/(\d+(?:\.\d+)?)%/);
  return {
    done: Boolean(doneLine),
    error: errorLine ? errorLine.slice(errorLine.indexOf("[ERROR]") + "[ERROR]".length).trim() : "",
    stage: phaseLine
      ? phaseLine.slice(phaseLine.indexOf("[PHASE]") + "[PHASE]".length).trim()
      : job?.stage ?? "",
    progress: progressMatch ? Number(progressMatch[1]) : job?.progress,
    downloadUrl: downloadMatch?.[1] ?? "",
  };
}

export function buildProposalReference(payload: ProposalPptPayload): string {
  return [
    "## 项目参数",
    `- 项目名称：${asText(payload.projectName)}`,
    `- 客户：${asText(payload.customer)}`,
    `- 位置：${asText(payload.location)}`,
    `- 场景：${asText(payload.scenario)}`,
    `- 面积：${asText(payload.area)}`,
    `- 基层情况：${asText(payload.baseCondition)}`,
    `- 推荐体系：${asText(payload.coatingSystem)}`,
    `- 客户诉求：${asText(payload.demand)}`,
    "",
    "## PPT 大纲",
    formatRows(payload.slides, ["title", "content"]),
    "",
    "## 知识引用",
    formatRows(payload.knowledge, ["name", "type", "status", "owner"]),
    "",
    "## 规则校验",
    formatRows(payload.rules, ["rule", "result", "detail"]),
    "",
    "## 溯源证据",
    formatRows(payload.citations, ["slide", "source", "evidence"]),
    "",
    "## 审批流程",
    formatRows(payload.approvals, ["node", "assignee", "status", "focus"]),
  ].join("\n");
}

function formatRows(value: unknown, keys: string[]): string {
  if (!Array.isArray(value)) return "- 无";
  return value
    .map((row, index) => {
      if (typeof row !== "object" || row === null) return `- ${index + 1}. ${String(row)}`;
      const record = row as Record<string, unknown>;
      const parts = keys
        .map((key) => `${key}: ${asText(record[key])}`)
        .filter((item) => item.trim() !== `${item.split(":")[0]}:`);
      return `- ${index + 1}. ${parts.join("；")}`;
    })
    .join("\n");
}

export async function generateProposalSlidesWithModel(
  payload: ProposalPptPayload,
  qwenApiKey: string,
  logPath: string,
  job: ProposalPptJobState,
) {
  if (!qwenApiKey) return handleMissingApiKey(logPath, job);
  markModelPhase(logPath, job);
  try {
    const response = await callQwenForSlides(payload, qwenApiKey);
    return await parseModelSlidesResponse(response, logPath, job);
  } catch (error) {
    return handleModelError(error, logPath);
  }
}

function handleMissingApiKey(logPath: string, job: ProposalPptJobState): [] {
  appendLog(logPath, "[PHASE] 未配置 QWEN_API_KEY，使用页面大纲生成 PPTX");
  job.stage = "未配置 QWEN_API_KEY，使用页面大纲生成 PPTX";
  job.progress = 45;
  return [];
}

function markModelPhase(logPath: string, job: ProposalPptJobState) {
  appendLog(logPath, "[PHASE] 正在调用自有模型生成 PPT 内容");
  job.stage = "正在调用自有模型生成 PPT 内容";
  job.progress = 32;
}

function handleModelError(error: unknown, logPath: string): [] {
  appendLog(
    logPath,
    `[PHASE] 自有模型调用异常，使用页面大纲兜底：${error instanceof Error ? error.message : String(error)}`,
  );
  return [];
}

async function callQwenForSlides(payload: ProposalPptPayload, qwenApiKey: string) {
  return fetch(qwenApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${qwenApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3.6-plus",
      stream: false,
      enable_thinking: false,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "你是工程方案 PPT 编写助手。只输出 JSON，不要 Markdown。JSON 格式为 {\"slides\":[{\"title\":\"...\",\"content\":\"...\"}]}，每页 content 用中文写 3-5 个具体要点。",
        },
        { role: "user", content: buildProposalReference(payload) },
      ],
    }),
  });
}

async function parseModelSlidesResponse(
  response: Response,
  logPath: string,
  job: ProposalPptJobState,
): Promise<unknown[]> {
  if (!response.ok) {
    appendLog(logPath, `[PHASE] 自有模型调用失败，使用页面大纲兜底：HTTP ${response.status}`);
    return [];
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = parseModelJson(content);
  const slides = Array.isArray(parsed?.slides) ? parsed.slides : [];
  appendLog(logPath, `[PHASE] 自有模型生成完成，页数=${slides.length}`);
  job.stage = "自有模型生成完成";
  job.progress = 60;
  return slides;
}
