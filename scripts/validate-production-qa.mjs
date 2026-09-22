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
assert(!headers.includes("unsafe-eval") && !headers.includes("script-src *") && !headers.includes("connect-src *"), "Deploy CSP is overly permissive.");
for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  for (const script of source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attributes = script[1];
    const body = script[2].trim();
    const inertJsonLd = attributes.includes('type="application/ld+json"');
    assert(inertJsonLd || attributes.includes("src=") || !body, `CSP-incompatible inline executable script in ${path.relative(dist, file)}`);
  }
}

console.log("Production QA static security/output validation passed.");
