import { access, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const layerRules = [
  {
    layer: "core",
    directory: path.join(sourceRoot, "core"),
    forbiddenLayers: new Set(["features", "theme", "project"]),
  },
  {
    layer: "features",
    directory: path.join(sourceRoot, "features"),
    forbiddenLayers: new Set(["theme", "project"]),
  },
  {
    layer: "theme",
    directory: path.join(sourceRoot, "theme"),
    forbiddenLayers: new Set(["project"]),
  },
];

const checkedExtensions = new Set([".ts", ".tsx", ".astro", ".js", ".jsx", ".mjs"]);
const resolvableExtensions = ["", ".ts", ".tsx", ".astro", ".js", ".jsx", ".mjs", ".json"];
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;
const aliasRoots = new Map([
  ["@core/", path.join(sourceRoot, "core")],
  ["@features/", path.join(sourceRoot, "features")],
  ["@theme/", path.join(sourceRoot, "theme")],
  ["@project/", path.join(sourceRoot, "project")],
]);

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

async function pathExists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function resolveCandidate(basePath) {
  for (const extension of resolvableExtensions) {
    const fileCandidate = `${basePath}${extension}`;
    if (await pathExists(fileCandidate)) {
      return realpath(fileCandidate);
    }
  }

  for (const extension of resolvableExtensions.filter(Boolean)) {
    const indexCandidate = path.join(basePath, `index${extension}`);
    if (await pathExists(indexCandidate)) {
      return realpath(indexCandidate);
    }
  }

  return null;
}

async function resolveImport(file, specifier) {
  if (specifier.startsWith(".")) {
    return resolveCandidate(path.resolve(path.dirname(file), specifier));
  }

  for (const [alias, directory] of aliasRoots) {
    if (specifier.startsWith(alias)) {
      return resolveCandidate(path.join(directory, specifier.slice(alias.length)));
    }
  }

  return null;
}

function detectLayer(resolvedPath) {
  const relative = path.relative(sourceRoot, resolvedPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return relative.split(path.sep)[0];
}

const violations = [];

for (const rule of layerRules) {
  const files = await listFiles(rule.directory);

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];
      const resolved = await resolveImport(file, specifier);
      if (!resolved) {
        continue;
      }

      const targetLayer = detectLayer(resolved);
      if (targetLayer && rule.forbiddenLayers.has(targetLayer)) {
        violations.push(
          `${path.relative(root, file)} imports ${specifier}; ${rule.layer} cannot depend on ${targetLayer}`,
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
