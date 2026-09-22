import { spawn } from "node:child_process";

const environment = process.argv[2];
if (!["preview", "production"].includes(environment)) {
  throw new Error("Usage: node scripts/build-deployment.mjs <preview|production>");
}

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error("build-deployment.mjs must run through pnpm.");

const child = spawn(process.execPath, [pnpmCli, "build"], {
  cwd: process.cwd(),
  env: { ...process.env, DEPLOY_ENV: environment },
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
