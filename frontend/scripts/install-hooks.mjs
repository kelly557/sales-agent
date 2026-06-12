#!/usr/bin/env node
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(frontendRoot, "..");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const hookPath = path.join(hooksDir, "pre-commit");

if (!existsSync(path.join(repoRoot, ".git"))) {
  console.log("Git directory not found; skipped hook installation.");
  process.exit(0);
}

mkdirSync(hooksDir, { recursive: true });

writeFileSync(
  hookPath,
  `#!/bin/sh
set -e

cd "$(git rev-parse --show-toplevel)/frontend"
npm run harness:staged
npm run lint
npm run typecheck
`,
);

chmodSync(hookPath, 0o755);
console.log("Installed Git pre-commit harness hook.");
