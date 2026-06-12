import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const skillsRoot = path.resolve(frontendRoot, "..", "skills");
const publicSkillsDir = path.join(frontendRoot, "public", "skills");

if (!fs.existsSync(skillsRoot)) {
  console.log("skills/ 目录不存在，跳过");
  process.exit(0);
}

fs.rmSync(publicSkillsDir, { recursive: true, force: true });
fs.cpSync(skillsRoot, publicSkillsDir, { recursive: true });

const index = { skills: [], entries: {} };
const skillDirs = fs.readdirSync(publicSkillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(publicSkillsDir, e.name, "SKILL.md")));

for (const entry of skillDirs) {
  index.skills.push({ slug: entry.name, skillPath: `${entry.name}/SKILL.md` });
  index.entries[entry.name] = {};

  function walk(dirPath, relDir) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((e) => !e.name.startsWith(".") && e.name !== "__pycache__")
      .map((e) => ({
        name: e.name,
        path: relDir ? `${relDir}/${e.name}` : e.name,
        type: e.isDirectory() ? "dir" : "file",
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    index.entries[entry.name][relDir] = entries;
    for (const e of entries) {
      if (e.type === "dir") {
        walk(path.join(dirPath, e.name), e.path);
      }
    }
  }
  walk(path.join(publicSkillsDir, entry.name), "");
}

fs.writeFileSync(
  path.join(publicSkillsDir, ".skills-index.json"),
  JSON.stringify(index, null, 2),
  "utf-8",
);

console.log(`✓ skills/ 已部署: ${skillDirs.length} 个技能目录`);
