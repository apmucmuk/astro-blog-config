import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const scriptPath = path.resolve(process.cwd(), "scripts/validate-content.mjs");

async function createFixture(overrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "content-fixture-"));
  await mkdir(path.join(root, "blog"), { recursive: true });
  await mkdir(path.join(root, "people"), { recursive: true });
  await mkdir(path.join(root, "data"), { recursive: true });

  await writeFile(
    path.join(root, "data/categories.json"),
    JSON.stringify([{ id: "poradniki", locale: "pl", slug: "poradniki", name: "Poradniki" }]),
  );

  await writeFile(
    path.join(root, "people/jan-kowalski.json"),
    JSON.stringify({
      id: "jan-kowalski",
      name: "Jan Kowalski",
      slug: "jan-kowalski",
      locale: "pl",
      role: "author",
      rank: 50,
      headline: "Autor",
      bioShort: "Bio",
      bio: "Bio",
      expertise: [],
      links: [],
    }),
  );

  const baseArticle = {
    id: "art-001",
    slug: "testowy-artykul",
    category: "poradniki",
    author: "jan-kowalski",
    title: "Testowy artykuł",
  };
  const article = { ...baseArticle, ...overrides.article };

  await writeFile(path.join(root, "blog/article.mdx"), mdxArticle(article));

  if (overrides.secondArticle) {
    await writeFile(path.join(root, "blog/article-2.mdx"), mdxArticle(overrides.secondArticle));
  }

  return root;
}

function mdxArticle(article) {
  return `---
id: "${article.id}"
title: "${article.title ?? "Testowy artykuł"}"
description: "Opis testowy"
slug: "${article.slug}"
locale: "pl"
translationKey: "${article.translationKey ?? article.id}"
publishDate: "2026-09-01T09:00:00+02:00"
authors:
  - "${article.author}"
contributors: []
category: "${article.category}"
tags: []
image:
  src: "/images/sample-move.svg"
  alt: "Obraz testowy"
draft: false
---

Treść testowa.
`;
}

async function runValidation(contentRoot) {
  return execFileAsync(process.execPath, [scriptPath], {
    cwd: process.cwd(),
    env: { ...process.env, CONTENT_ROOT: contentRoot },
  });
}

describe("content validation script", () => {
  it("passes valid content", async () => {
    const fixture = await createFixture();
    await expect(runValidation(fixture)).resolves.toMatchObject({
      stdout: expect.stringContaining("Content validation passed"),
    });
  });

  it("fails on duplicate article id", async () => {
    const fixture = await createFixture({
      secondArticle: {
        id: "art-001",
        slug: "drugi-artykul",
        category: "poradniki",
        author: "jan-kowalski",
      },
    });

    await expect(runValidation(fixture)).rejects.toMatchObject({
      stderr: expect.stringContaining("Duplicate article id"),
    });
  });

  it("fails on duplicate article route", async () => {
    const fixture = await createFixture({
      secondArticle: {
        id: "art-002",
        slug: "testowy-artykul",
        category: "poradniki",
        author: "jan-kowalski",
      },
    });

    await expect(runValidation(fixture)).rejects.toMatchObject({
      stderr: expect.stringContaining("Duplicate article route"),
    });
  });

  it("fails on unknown category", async () => {
    const fixture = await createFixture({ article: { category: "brak" } });

    await expect(runValidation(fixture)).rejects.toMatchObject({
      stderr: expect.stringContaining("unknown category"),
    });
  });

  it("fails on unknown author", async () => {
    const fixture = await createFixture({ article: { author: "brak-autora" } });

    await expect(runValidation(fixture)).rejects.toMatchObject({
      stderr: expect.stringContaining("unknown author"),
    });
  });
});
