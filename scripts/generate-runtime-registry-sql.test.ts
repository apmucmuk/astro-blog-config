import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const sqlPath = path.join(root, "worker/registry/content-articles.sql");

describe("remote D1 registry SQL", () => {
  it("is deterministic, idempotent, and contains no explicit transaction controls", async () => {
    execFileSync(process.execPath, ["scripts/generate-runtime-registry-sql.mjs"], { cwd: root, stdio: "pipe" });
    const first = await readFile(sqlPath, "utf8");
    execFileSync(process.execPath, ["scripts/generate-runtime-registry-sql.mjs"], { cwd: root, stdio: "pipe" });
    const second = await readFile(sqlPath, "utf8");

    expect(second).toBe(first);
    expect(first).toContain("ON CONFLICT(site_id, article_id) DO UPDATE");
    expect(first).toContain("runtime_enabled = 0");
    expect(first).not.toMatch(/\bBEGIN(?:\s+TRANSACTION)?\s*;/i);
    expect(first).not.toMatch(/\bCOMMIT\s*;/i);
    expect(first).not.toMatch(/\bSAVEPOINT\b/i);
  });
});
