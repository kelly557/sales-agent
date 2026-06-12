#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv.includes("--staged") ? "staged" : "all";
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".md"]);
const codeExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const checkedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html"]);
const cssExtensions = new Set([".css", ".html"]);
const ignoreParts = new Set(["node_modules", "dist", ".git", "coverage"]);
const forbiddenFiles = [/\.DS_Store$/, /\.log$/, /\.env$/, /\.pem$/, /\.key$/, /id_rsa$/];
const forbiddenCopy = [
  "跟踪生成、审查、复用和交付检查任务，优先处理缺口和复核项",
  "lorem ipsum",
  "foo bar",
];
const secretPatterns = [
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/i,
  /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
];

const limits = {
  ".tsx": 300,
  ".ts": 400,
  ".jsx": 300,
  ".js": 400,
  ".css": 600,
  ".html": 900,
};

const typographyTokenRules = [
  {
    property: "font-family",
    allowed: [/var\(--font-family-ui\)/],
    message: "font-family 必须使用 var(--font-family-ui)",
  },
  {
    property: "font-size",
    allowed: [/var\(--font-size-[a-z-]+\)/, /var\(--heading-size\)/, /var\(--body-size\)/],
    message: "font-size 必须使用统一字号 token",
  },
  {
    property: "font-weight",
    allowed: [/var\(--font-weight-(?:regular|semibold)\)/],
    message: "font-weight 必须使用统一字重 token",
  },
  {
    property: "line-height",
    allowed: [/var\(--line-height-(?:tight|body)\)/, /var\(--line-height\)/],
    message: "line-height 必须使用统一行高 token",
  },
  {
    property: "letter-spacing",
    allowed: [/0\b/, /var\(--letter-spacing-[a-z-]+\)/],
    message: "letter-spacing 只能为 0 或统一 token",
  },
];

const failures = [];
const warnings = [];

function relative(filePath) {
  return path.relative(root, filePath);
}

function addFailure(message) {
  failures.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return ignoreParts.has(entry.name) ? [] : listFiles(fullPath);
    }
    return [fullPath];
  });
}

function getStagedFiles() {
  try {
    const output = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
      cwd: root,
      encoding: "utf8",
    });

    return output
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => path.resolve(root, item))
      .filter((item) => existsSync(item));
  } catch {
    addWarning("无法读取暂存文件，已跳过 staged 专用检查。");
    return [];
  }
}

function getFiles() {
  const files = mode === "staged" ? getStagedFiles() : listFiles(root);
  return files.filter((file) => sourceExtensions.has(path.extname(file)));
}

function countLines(text) {
  return text.length ? text.split(/\r?\n/).length : 0;
}

function checkForbiddenFiles(files) {
  files.forEach((file) => {
    const name = relative(file);
    if (forbiddenFiles.some((pattern) => pattern.test(name))) {
      addFailure(`禁止提交临时或敏感文件：${name}`);
    }
  });
}

function checkTextRules(files) {
  files.forEach((file) => {
    const ext = path.extname(file);
    if (!checkedExtensions.has(ext)) return;

    const text = readFileSync(file, "utf8");
    const name = relative(file);

    forbiddenCopy.forEach((copy) => {
      if (text.toLowerCase().includes(copy.toLowerCase())) {
        addFailure(`发现禁用或占位文案：${name} 包含「${copy}」`);
      }
    });

    secretPatterns.forEach((pattern) => {
      if (pattern.test(text)) {
        addFailure(`发现疑似密钥或敏感配置：${name}`);
      }
    });
  });
}

function checkFileSizes(files) {
  files.forEach((file) => {
    const ext = path.extname(file);
    const max = limits[ext];
    if (!max) return;

    const lines = countLines(readFileSync(file, "utf8"));
    if (lines > max) {
      addFailure(`文件过大：${relative(file)} ${lines} 行，限制 ${max} 行`);
    }
  });
}

function checkFunctionSizes(files) {
  files.forEach((file) => {
    const ext = path.extname(file);
    if (!codeExtensions.has(ext)) return;

    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const stack = [];

    lines.forEach((line, index) => {
      const declaration = line.match(/^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/);
      const arrow = line.match(/^\s*const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
      const name = declaration?.[1] || arrow?.[1];

      if (name) {
        stack.push({ name, start: index + 1, depth: 0, seenBrace: false });
      }

      const opens = (line.match(/{/g) || []).length;
      const closes = (line.match(/}/g) || []).length;

      stack.forEach((item) => {
        item.depth += opens;
        item.depth -= closes;
        if (opens) item.seenBrace = true;
      });

      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const item = stack[i];
        if (item.seenBrace && item.depth <= 0) {
          const length = index + 1 - item.start + 1;
          const isComponent = /^[A-Z]/.test(item.name);
          const limit = isComponent ? 160 : 40;
          if (length > limit) {
            addFailure(`函数过大：${relative(file)}:${item.start} ${item.name} ${length} 行，限制 ${limit} 行`);
          }
          stack.splice(i, 1);
        }
      }
    });
  });
}

function checkTypographyTokens(files) {
  files.forEach((file) => {
    const ext = path.extname(file);
    if (!cssExtensions.has(ext)) return;

    const name = relative(file);
    const isTuner = name.includes("public/tuners/");
    const lines = readFileSync(file, "utf8").split(/\r?\n/);

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("--") || trimmed.startsWith("*")) return;
      if (/font:\s*inherit\b/.test(trimmed)) return;
      if (isTuner && /font-family:\s*SF Pro Text/.test(trimmed)) return;

      typographyTokenRules.forEach((rule) => {
        const match = trimmed.match(new RegExp(`\\b${rule.property}\\s*:\\s*([^;]+);`));
        if (!match) return;

        const value = match[1].trim();
        const isAllowed = rule.allowed.some((pattern) => pattern.test(value));
        if (!isAllowed) {
          addFailure(`字体规范违规：${name}:${index + 1} ${rule.message}，当前为 ${rule.property}: ${value}`);
        }
      });
    });
  });
}

function checkVitePort() {
  const configPath = path.join(root, "vite.config.ts");
  if (!existsSync(configPath)) {
    addWarning("未找到 vite.config.ts，跳过 2288 端口检查。");
    return;
  }

  const config = readFileSync(configPath, "utf8");
  if (!/port\s*:\s*2288/.test(config)) {
    addFailure("vite.config.ts 必须显式配置 server/preview port: 2288");
  }
  if (!/strictPort\s*:\s*true/.test(config)) {
    addFailure("vite.config.ts 必须配置 strictPort: true，禁止自动递增端口");
  }
}

function checkPackageScripts() {
  const packagePath = path.join(root, "package.json");
  if (!existsSync(packagePath)) {
    addFailure("缺少 package.json，无法自动触发 harness。");
    return;
  }

  const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
  const scripts = pkg.scripts || {};
  ["dev", "build", "lint", "typecheck", "harness"].forEach((script) => {
    if (!scripts[script]) addFailure(`package.json 缺少脚本：${script}`);
  });
  if (!String(scripts.dev || "").includes("2288")) {
    addFailure("package.json dev 脚本必须绑定 2288 端口");
  }
}

function checkHarnessArtifacts() {
  const srcData = path.join(root, "src", "data");
  const tunerDir = path.join(root, "public", "tuners");

  if (!existsSync(srcData) || !readdirSync(srcData).some((file) => /\.(ts|js)$/.test(file))) {
    addFailure("缺少本地 demo/mock 数据文件：src/data/*.ts");
  }

  if (!existsSync(tunerDir)) {
    addFailure("缺少 tuner 目录：public/tuners");
    return;
  }

  const tunerFiles = readdirSync(tunerDir).filter((file) => file.endsWith("-tuner.html"));
  if (!tunerFiles.length) {
    addFailure("缺少 slider 调参页：public/tuners/*-tuner.html");
  }

  tunerFiles.forEach((file) => {
    const fullPath = path.join(tunerDir, file);
    const text = readFileSync(fullPath, "utf8");
    const staticSliderCount = (text.match(/type=["']range["']/g) || []).length;
    const paramCount = (text.match(/key:\s*["']--/g) || []).length;
    const sliderCount = Math.max(staticSliderCount, paramCount);
    if (sliderCount < 6) {
      addFailure(`tuner slider 不足 6 个：public/tuners/${file}`);
    }
    if (!/clipboard\.writeText/.test(text)) {
      addFailure(`tuner 缺少复制参数 JSON 能力：public/tuners/${file}`);
    }
  });
}

function checkGitHook() {
  const hookPath = path.resolve(root, "..", ".git", "hooks", "pre-commit");
  if (!existsSync(hookPath)) {
    addFailure("缺少 Git pre-commit hook，无法保证提交前自动触发 harness。");
    return;
  }

  const hook = readFileSync(hookPath, "utf8");
  if (!hook.includes("npm run harness:staged")) {
    addFailure("Git pre-commit hook 未调用 npm run harness:staged。");
  }
}

function checkNoLargeGeneratedFiles(files) {
  files.forEach((file) => {
    const name = relative(file);
    const size = statSync(file).size;
    if (/\.(png|jpg|jpeg|webp|gif|pdf|zip)$/.test(name) && size > 2 * 1024 * 1024) {
      addFailure(`疑似大型生成产物：${name}`);
    }
  });
}

const files = getFiles();
checkForbiddenFiles(files);
checkTextRules(files);
checkFileSizes(files);
checkFunctionSizes(files);
checkTypographyTokens(files);
checkVitePort();
checkPackageScripts();
checkHarnessArtifacts();
checkGitHook();
checkNoLargeGeneratedFiles(files);

if (warnings.length) {
  console.warn(`\nHarness warnings (${warnings.length}):`);
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (failures.length) {
  console.error(`\nHarness failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Harness passed (${mode} mode). Checked ${files.length} files.`);
