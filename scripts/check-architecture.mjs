import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const layerRules = [
  {
    layer: "core",
    directory: path.join(sourceRoot, "core"),
    forbidden: ["@features/", "@theme/", "@project/"],
  },
  {
    layer: "features",
    directory: path.join(sourceRoot, "features"),
    forbidden: ["@theme/", "@project/"],
  },
  {
    layer: "theme",
    directory: path.join(sourceRoot, "theme"),
    forbidden: ["@project/"],
  },
];

const checkedExtensions = new Set([".ts", ".tsx", ".astro", ".js", ".jsx", ".mjs"]);
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listFiles(absolutePath);
      }

      return checkedExtensions.has(path.extname(entry.name)) ? [absolutePath] : [];
    }),
  );

  return files.flat();
}

const violations = [];

for (const rule of layerRules) {
  const files = await listFiles(rule.directory);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];
      const forbiddenAlias = rule.forbidden.find((alias) => specifier.startsWith(alias));
      if (forbiddenAlias) {
        violations.push(
          `${path.relative(root, file)} imports ${specifier}; ${rule.layer} cannot depend on ${forbiddenAlias}`,
        );
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture boundary violations found:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Architecture boundary check passed.");
