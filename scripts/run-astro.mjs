import { spawn } from "node:child_process";
import path from "node:path";

const astroCli = path.join(process.cwd(), "node_modules", "astro", "bin", "astro.mjs");
const child = spawn(process.execPath, [astroCli, ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: "1",
  },
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }

  process.exit(code ?? 1);
});
