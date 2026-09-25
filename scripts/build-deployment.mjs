import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const environment = process.argv[2];
if (!["preview", "production"].includes(environment)) {
  throw new Error("Usage: node scripts/build-deployment.mjs <preview|production>");
}

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error("build-deployment.mjs must run through pnpm.");

async function loadPublicDeploymentEnv(deploymentEnvironment) {
  const envPath = path.join(process.cwd(), `.env.${deploymentEnvironment}`);
  let source;
  try {
    source = await readFile(envPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return {};
    throw error;
  }

  return Object.fromEntries(source.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*(PUBLIC_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) return [];
    const [, name, rawValue] = match;
    const value = rawValue.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
    return [[name, value]];
  }));
}

const publicDeploymentEnv = await loadPublicDeploymentEnv(environment);
if (environment === "preview" && !publicDeploymentEnv.PUBLIC_API_URL) {
  throw new Error("Preview deployment requires PUBLIC_API_URL in .env.preview.");
}

const snapshot = spawn(process.execPath, ["scripts/generate-featured-comments.mjs", environment], { cwd: process.cwd(), env: process.env, stdio: "inherit" });
await new Promise((resolve, reject) => snapshot.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Featured comments snapshot failed (${code}).`))));

const child = spawn(process.execPath, [pnpmCli, "build"], {
  cwd: process.cwd(),
  env: { ...process.env, ...publicDeploymentEnv, DEPLOY_ENV: environment },
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
