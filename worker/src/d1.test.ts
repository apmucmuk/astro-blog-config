import { describe, expect, it } from "vitest";
import { ensureArticleStats } from "./d1";
import type { D1Database, D1PreparedStatement, D1Result } from "./types";

type ArticleRow = {
  site_id: string;
  article_id: string;
  publish_at_ms: number;
  runtime_enabled: number;
  updated_at_ms: number;
};

type StatsRow = {
  site_id: string;
  article_id: string;
  reads: number;
  comments_count: number;
  rating_sum: number;
  rating_count: number;
  updated_at_ms: number;
};

class FakeStatement implements D1PreparedStatement {
  private values: unknown[] = [];

  constructor(
    private readonly db: FakeD1Database,
    private readonly query: string,
  ) {}

  bind(...values: unknown[]): D1PreparedStatement {
    this.values = values;
    return this;
  }

  async first<T = unknown>(): Promise<T | null> {
    return this.db.first(this.query, this.values) as T | null;
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    this.db.run(this.query, this.values);
    return { success: true, meta: {} };
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    const row = this.db.first(this.query, this.values);
    return { success: true, meta: {}, results: row ? [row as T] : [] };
  }
}

class FakeD1Database implements D1Database {
  readonly articles = new Map<string, ArticleRow>();
  readonly stats = new Map<string, StatsRow>();

  prepare(query: string): D1PreparedStatement {
    return new FakeStatement(this, query);
  }

  first(query: string, values: unknown[]): ArticleRow | StatsRow | null {
    const key = `${values[0]}:${values[1]}`;
    if (query.includes("FROM content_articles")) {
      return this.articles.get(key) ?? null;
    }
    if (query.includes("FROM article_stats")) {
      return this.stats.get(key) ?? null;
    }
    throw new Error(`Unsupported fake D1 first query: ${query}`);
  }

  run(query: string, values: unknown[]): void {
    if (!query.includes("INSERT INTO article_stats")) {
      throw new Error(`Unsupported fake D1 run query: ${query}`);
    }

    const key = `${values[0]}:${values[1]}`;
    if (this.stats.has(key)) {
      return;
    }

    this.stats.set(key, {
      site_id: values[0] as string,
      article_id: values[1] as string,
      reads: 0,
      comments_count: 0,
      rating_sum: 0,
      rating_count: 0,
      updated_at_ms: values[2] as number,
    });
  }
}

describe("ensureArticleStats", () => {
  it("creates a default aggregate row after content registry validation", async () => {
    const db = new FakeD1Database();
    db.articles.set("tragarze-pl:art-tragarze-001", {
      site_id: "tragarze-pl",
      article_id: "art-tragarze-001",
      publish_at_ms: 1,
      runtime_enabled: 1,
      updated_at_ms: 2,
    });

    const stats = await ensureArticleStats(db, "tragarze-pl", "art-tragarze-001", 1234);

    expect(stats).toEqual({
      siteId: "tragarze-pl",
      articleId: "art-tragarze-001",
      reads: 0,
      commentsCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      updatedAtMs: 1234,
    });
  });

  it("does not replace an existing aggregate row", async () => {
    const db = new FakeD1Database();
    db.articles.set("tragarze-pl:art-tragarze-001", {
      site_id: "tragarze-pl",
      article_id: "art-tragarze-001",
      publish_at_ms: 1,
      runtime_enabled: 1,
      updated_at_ms: 2,
    });
    db.stats.set("tragarze-pl:art-tragarze-001", {
      site_id: "tragarze-pl",
      article_id: "art-tragarze-001",
      reads: 9,
      comments_count: 2,
      rating_sum: 20,
      rating_count: 5,
      updated_at_ms: 99,
    });

    const stats = await ensureArticleStats(db, "tragarze-pl", "art-tragarze-001", 1234);

    expect(stats.reads).toBe(9);
    expect(stats.commentsCount).toBe(2);
    expect(stats.updatedAtMs).toBe(99);
  });

  it("rejects missing or disabled registry entries before aggregate initialization", async () => {
    const db = new FakeD1Database();

    await expect(ensureArticleStats(db, "tragarze-pl", "missing", 1234)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });

    db.articles.set("tragarze-pl:disabled", {
      site_id: "tragarze-pl",
      article_id: "disabled",
      publish_at_ms: 1,
      runtime_enabled: 0,
      updated_at_ms: 2,
    });

    await expect(ensureArticleStats(db, "tragarze-pl", "disabled", 1234)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
    expect(db.stats.size).toBe(0);
  });
});
