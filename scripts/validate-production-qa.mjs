import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : [target];
  }));
  return nested.flat();
}

const outputFiles = await files(dist);
const htmlFiles = outputFiles.filter((file) => file.endsWith(".html"));
const staticOutput = await Promise.all(outputFiles.map(async (file) => [file, await readFile(file, "utf8")]));
for (const sensitiveName of ["TURNSTILE_SECRET_KEY", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_D1_DATABASE_ID", "CF_ACCESS_AUD"]) {
  assert(!staticOutput.some(([, source]) => source.includes(sensitiveName)), `Sensitive configuration name leaked into static output: ${sensitiveName}`);
}

const headers = await readFile(path.join(dist, "_headers"), "utf8");
const csp = headers.match(/^  Content-Security-Policy: (.+)$/m)?.[1] ?? "";
assert(csp.includes("script-src 'self'") && csp.includes("'wasm-unsafe-eval'") && csp.includes("https://challenges.cloudflare.com"), "Deploy CSP must permit Pagefind WebAssembly without enabling general unsafe-eval.");
assert(!csp.includes("'unsafe-eval'") && !csp.includes("script-src *") && !csp.includes("connect-src *"), "Deploy CSP is overly permissive.");
const bootstrapBodies = new Set();
for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  for (const script of source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attributes = script[1];
    const body = script[2];
    const inertJsonLd = attributes.includes('type="application/ld+json"');
    if (!inertJsonLd && !attributes.includes("src=") && body) bootstrapBodies.add(body);
  }
}
assert(bootstrapBodies.size === 1, "Static HTML must contain exactly one deterministic executable inline bootstrap.");
const bootstrapHash = createHash("sha256").update([...bootstrapBodies][0], "utf8").digest("base64");
assert(csp.includes(`'sha256-${bootstrapHash}'`), "Deploy CSP must authorize the exact inline theme bootstrap via SHA-256.");
const arbitraryHash = createHash("sha256").update("window.__arbitraryInlineScript=true", "utf8").digest("base64");
assert(!csp.includes(`'sha256-${arbitraryHash}'`), "Deploy CSP must not authorize arbitrary inline executable scripts.");

console.log("Production QA static security/output validation passed.");
