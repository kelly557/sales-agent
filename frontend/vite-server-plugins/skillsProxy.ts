import fs from "node:fs";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const SKILLS_ROOT = path.resolve(process.cwd(), "..", "skills");

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendText(res: ServerResponse, statusCode: number, body: string) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.end(body);
}

function resolveSkillDir(slug: string): string | null {
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(slug)) return null;
  const target = path.resolve(SKILLS_ROOT, slug);
  if (target !== SKILLS_ROOT && !target.startsWith(SKILLS_ROOT + path.sep)) return null;
  return fs.existsSync(path.join(target, "SKILL.md")) ? target : null;
}

function readSkillFile(skillDir: string, relativePath: string): string | null {
  const safe = relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
  if (!safe || safe.includes("..")) return null;
  const target = path.resolve(skillDir, safe);
  if (target !== skillDir && !target.startsWith(skillDir + path.sep)) return null;
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return null;
  return fs.readFileSync(target, "utf8");
}

function listFiles(skillDir: string, relativeDir: string): { name: string; path: string; type: "file" | "dir" }[] {
  const safe = relativeDir.replace(/^\/+/, "").replace(/\\/g, "/");
  if (safe.includes("..")) return [];
  const target = safe ? path.resolve(skillDir, safe) : skillDir;
  if (target !== skillDir && !target.startsWith(skillDir + path.sep)) return [];
  if (!fs.existsSync(target)) return [];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith(".") && entry.name !== "__pycache__")
    .map((entry) => {
      const type: "file" | "dir" = entry.isDirectory() ? "dir" : "file";
      return {
        name: entry.name,
        path: safe ? `${safe.replace(/\/+$/, "")}/${entry.name}` : entry.name,
        type,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function createSkillsProxy(): Plugin {
  return {
    name: "doctech-skills-proxy",
    configureServer(server) {
      server.middlewares.use("/api/skills", (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const segments = url.pathname.split("/").filter(Boolean);
        const slug = segments[0];
        const action = segments[1];

        if (!slug) {
          if (!fs.existsSync(SKILLS_ROOT)) {
            sendJson(res, 200, { skills: [] });
            return;
          }
          const skills = fs
            .readdirSync(SKILLS_ROOT, { withFileTypes: true })
            .filter(
              (entry) => entry.isDirectory() && fs.existsSync(path.join(SKILLS_ROOT, entry.name, "SKILL.md")),
            )
            .map((entry) => ({
              slug: entry.name,
              skillPath: path.join(SKILLS_ROOT, entry.name, "SKILL.md"),
            }));
          sendJson(res, 200, { skills });
          return;
        }

        const skillDir = resolveSkillDir(slug);
        if (!skillDir) {
          sendJson(res, 404, { error: `未找到技能：${slug}` });
          return;
        }

        if (action === "raw") {
          const filePath = url.searchParams.get("path") ?? "";
          const content = readSkillFile(skillDir, filePath);
          if (content === null) {
            sendJson(res, 404, { error: `文件不存在：${filePath}` });
            return;
          }
          sendText(res, 200, content);
          return;
        }

        if (action === "files") {
          const sub = url.searchParams.get("path") ?? "";
          sendJson(res, 200, { entries: listFiles(skillDir, sub) });
          return;
        }

        if (!action) {
          sendJson(res, 200, { slug, entries: listFiles(skillDir, "") });
          return;
        }

        sendJson(res, 404, { error: "未支持的子操作" });
      });
    },
  };
}

export type SkillsRequestHandler = (req: IncomingMessage, res: ServerResponse) => void;
