import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [];
for (const entry of [
  "README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
])
  files.push(entry);

function visit(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = path.join(dir, item.name);
    if (item.isDirectory()) visit(relative);
    else if (relative.endsWith(".md")) files.push(relative);
  }
}
visit("docs");

const broken = [];
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const resolved = path.resolve(
      root,
      path.dirname(file),
      decodeURIComponent(target),
    );
    if (!fs.existsSync(resolved)) broken.push(`${file}: ${target}`);
  }
}
if (broken.length) {
  console.error(`Broken local documentation links:\n${broken.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Checked local links in ${files.length} Markdown files.`);
}
