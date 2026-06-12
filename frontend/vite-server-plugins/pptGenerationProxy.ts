import type { IncomingMessage, ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import {
  appendLog,
  asText,
  generateProposalSlidesWithModel,
  parsePptLog,
  readJsonBody,
  readTail,
  sendJson,
} from "./pptGenerationShared";

interface DevServerEnv {
  qwenApiKey: string;
}

interface ProposalPptPayload {
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

interface ProposalPptJob {
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

const proposalJobs = new Map<string, ProposalPptJob>();

export function createPptGenerationProxy(env: DevServerEnv): Plugin {
  return {
    name: "doctech-ppt-generation-proxy",
    configureServer(server) {
      server.middlewares.use("/api/proposal/ppt", async (req, res, next) => {
        const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
        if (pathname !== "/") {
          next();
          return;
        }
        await handlePptStart(req, res, env);
      });
      server.middlewares.use("/api/proposal/ppt/status", (req, res) => {
        handlePptStatus(req, res);
      });
      server.middlewares.use("/api/proposal/ppt/download", (req, res) => {
        handlePptDownload(req, res);
      });
    },
  };
}

async function handlePptStart(req: IncomingMessage, res: ServerResponse, env: DevServerEnv) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "只支持 POST 请求" });
    return;
  }
  try {
    const body = (await readJsonBody(req)) as ProposalPptPayload;
    const job = startProposalPptJob(body, env.qwenApiKey);
    sendJson(res, 202, {
      jobId: job.id,
      status: job.status,
      outputPath: job.outputPath,
      logPath: job.logPath,
    });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "PPT 生成任务启动失败",
    });
  }
}

function handlePptStatus(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "", "http://localhost");
  const jobId = url.searchParams.get("jobId") ?? "";
  const job = proposalJobs.get(jobId);
  if (!job) {
    sendJson(res, 404, { error: "未找到 PPT 生成任务" });
    return;
  }
  const log = readTail(job.logPath, 80);
  const parsed = parsePptLog(log, job);
  const hasOutput = fs.existsSync(job.outputPath);
  const status =
    parsed.done || (job.status === "done" && hasOutput)
      ? "done"
      : parsed.error || job.status === "error"
        ? "error"
        : "running";
  if (status !== job.status) job.status = status;
  if (parsed.downloadUrl) job.downloadUrl = parsed.downloadUrl;
  if (parsed.error) job.error = parsed.error;
  sendJson(res, 200, {
    jobId,
    status,
    stage: parsed.stage,
    progress: parsed.progress,
    error: job.error,
    outputPath: job.outputPath,
    logPath: job.logPath,
    downloadUrl: job.downloadUrl,
    localDownloadUrl:
      status === "done" ? `/api/proposal/ppt/download?jobId=${encodeURIComponent(jobId)}` : "",
    log,
  });
}

function handlePptDownload(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "", "http://localhost");
  const jobId = url.searchParams.get("jobId") ?? "";
  const job = proposalJobs.get(jobId);
  if (!job || !fs.existsSync(job.outputPath)) {
    sendJson(res, 404, { error: "PPT 文件尚未生成" });
    return;
  }
  const fileName = path.basename(job.outputPath);
  const encodedFileName = encodeURIComponent(fileName);
  res.statusCode = 200;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="proposal.pptx"; filename*=UTF-8''${encodedFileName}`,
  );
  res.setHeader("Content-Length", String(fs.statSync(job.outputPath).size));
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(job.outputPath).pipe(res);
}

function startProposalPptJob(payload: ProposalPptPayload, qwenApiKey: string): ProposalPptJob {
  const generatedDir = path.resolve(process.cwd(), ".generated", "ppt");
  fs.mkdirSync(generatedDir, { recursive: true });
  const jobId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const title = asText(payload.projectName) || "定制方案 PPT";
  const safeTitle = title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9_-]+/g, "_").slice(0, 60) || "proposal";
  const outputPath = path.join(generatedDir, `${safeTitle}_${jobId}.pptx`);
  const logPath = path.join(generatedDir, `${safeTitle}_${jobId}.log`);
  const inputPath = path.join(generatedDir, `${safeTitle}_${jobId}.json`);
  const scriptPath = path.resolve(process.cwd(), "scripts", "generate_proposal_ppt.py");
  const job: ProposalPptJob = {
    id: jobId,
    outputPath,
    logPath,
    status: "running",
    stage: "正在整理方案参数",
    progress: 12,
    startedAt: Date.now(),
  };
  proposalJobs.set(jobId, job);
  fs.writeFileSync(logPath, `[PID] local\n[PHASE] 正在整理方案参数\n`, "utf8");
  void runProposalPptJob(payload, qwenApiKey, job, inputPath, outputPath, logPath, scriptPath);
  return job;
}

async function runProposalPptJob(
  payload: ProposalPptPayload,
  qwenApiKey: string,
  job: ProposalPptJob,
  inputPath: string,
  outputPath: string,
  logPath: string,
  scriptPath: string,
) {
  const enrichedPayload = {
    ...payload,
    modelSlides: await generateProposalSlidesWithModel(payload, qwenApiKey, logPath, job),
  };
  fs.writeFileSync(inputPath, JSON.stringify(enrichedPayload, null, 2), "utf8");
  appendLog(logPath, "[PHASE] 正在写入可编辑 PPTX");
  job.stage = "正在写入可编辑 PPTX";
  job.progress = 72;
  const child = spawn("python3", [scriptPath, "--input", inputPath, "--output", outputPath], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });
  wirePptChildHandlers(child, job, logPath, outputPath);
}

function wirePptChildHandlers(
  child: ReturnType<typeof spawn>,
  job: ProposalPptJob,
  logPath: string,
  outputPath: string,
) {
  child.stdout?.on("data", (chunk: Buffer) => appendLog(logPath, chunk.toString("utf8").trim()));
  child.stderr?.on("data", (chunk: Buffer) =>
    appendLog(logPath, `[ERROR] ${chunk.toString("utf8").trim()}`),
  );
  child.on("exit", (code) => handlePptChildExit(code, job, logPath, outputPath));
  child.on("error", (error) => {
    job.status = "error";
    job.error = error.message;
  });
}

function handlePptChildExit(code: number | null, job: ProposalPptJob, logPath: string, outputPath: string) {
  if (code === 0 && fs.existsSync(outputPath)) {
    job.status = "done";
    job.stage = "可编辑 PPTX 已生成";
    job.progress = 100;
    appendLog(logPath, `[DONE] saved=${outputPath}`);
    return;
  }
  job.status = "error";
  job.error = `本地 PPT 生成脚本退出码：${code}`;
  appendLog(logPath, `[ERROR] ${job.error}`);
}
