import { spawn } from "node:child_process";
import path from "node:path";

const cli = path.join(process.cwd(), "node_modules", "pagefind", "lib", "runner", "bin.cjs");
const child = spawn(process.execPath, [cli, "--site", "dist", "--output-path", "dist/pagefind", "--force-language", "pl"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
