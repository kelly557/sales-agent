import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

interface DevServerEnv {
  qwenApiKey: string;
}

interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
}

const qwenApiUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export function createQwenChatProxy(env: DevServerEnv): Plugin {
  return {
    name: "doctech-qwen-chat-proxy",
    configureServer(server) {
      server.middlewares.use("/api/qwen/chat", async (req, res) => {
        await handleChatRequest(req, res, env);
      });
    },
  };
}

async function handleChatRequest(req: IncomingMessage, res: ServerResponse, env: DevServerEnv) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "只支持 POST 请求" });
    return;
  }
  if (!env.qwenApiKey) {
    sendJson(res, 500, { error: "缺少 QWEN_API_KEY 环境变量" });
    return;
  }
  try {
    const body = await readJsonBody(req);
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const messages = normalizeMessages(body.messages);
    if (!prompt && messages.length === 0) {
      sendJson(res, 400, { error: "prompt 不能为空" });
      return;
    }
    const upstream = await fetchUpstreamChat(env.qwenApiKey, messages, prompt);
    if (!upstream.ok) return sendUpstreamError(res, upstream);
    if (!upstream.body) {
      sendJson(res, 502, { error: "Qwen API 未返回流式响应体" });
      return;
    }
    writeStreamHeaders(res);
    await pipeStreamToResponse(upstream.body, res);
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Qwen API 代理异常",
    });
  }
}

async function fetchUpstreamChat(
  qwenApiKey: string,
  messages: ChatMessagePayload[],
  prompt: string,
) {
  return fetch(qwenApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${qwenApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3.6-plus",
      stream: true,
      stream_options: { include_usage: true },
      enable_thinking: false,
      messages: [
        {
          role: "system",
          content: "你是工程文档助手，回答要面向工程交付场景，结构清晰、可执行，并用中文输出。",
        },
        ...(messages.length > 0 ? messages : [{ role: "user", content: prompt }]),
      ],
      temperature: 0.2,
    }),
  });
}

async function sendUpstreamError(res: ServerResponse, upstream: Response) {
  const upstreamBody = await upstream.json();
  sendJson(res, upstream.status, {
    error: upstreamBody?.error?.message ?? "Qwen API 调用失败",
    detail: upstreamBody,
  });
}

function writeStreamHeaders(res: ServerResponse) {
  res.writeHead(200, {
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8",
    "X-Accel-Buffering": "no",
  });
}

async function pipeStreamToResponse(body: ReadableStream<Uint8Array>, res: ServerResponse) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } finally {
    res.end();
  }
}

function normalizeMessages(messages: unknown): ChatMessagePayload[] {
  if (!Array.isArray(messages)) return [];
  return messages.flatMap((message) => {
    if (
      typeof message === "object" &&
      message !== null &&
      "role" in message &&
      (message.role === "user" || message.role === "assistant") &&
      "content" in message &&
      typeof message.content === "string" &&
      message.content.trim()
    ) {
      return [{ role: message.role, content: message.content.trim() }];
    }
    return [];
  });
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
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

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
