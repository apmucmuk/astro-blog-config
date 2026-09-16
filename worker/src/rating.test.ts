import { describe, expect, it } from "vitest";
import { parseRatingRequest } from "./rating";
import { submitRating } from "./rating";
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

type VoteRow = {
  site_id: string;
  article_id: string;
  visitor_id: string;
  value: number;
  created_at_ms: number;
  updated_at_ms: number;
};

class Statement implements D1PreparedStatement {
  private values: unknown[] = [];

  constructor(
    private readonly db: RatingDb,
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

class RatingDb implements D1Database {
  readonly articles = new Map<string, ArticleRow>();
  readonly stats = new Map<string, StatsRow>();
  readonly votes = new Map<string, VoteRow>();
  failNextBatch = false;

  constructor() {
    this.articles.set("tragarze-pl:art-tragarze-001", {
      site_id: "tragarze-pl",
      article_id: "art-tragarze-001",
      publish_at_ms: 1,
      runtime_enabled: 1,
      updated_at_ms: 1,
    });
    this.articles.set("tragarze-pl:disabled", {
      site_id: "tragarze-pl",
      article_id: "disabled",
      publish_at_ms: 1,
      runtime_enabled: 0,
      updated_at_ms: 1,
    });
  }

  prepare(query: string): D1PreparedStatement {
    return new Statement(this, query);
  }

  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    if (this.failNextBatch) {
      this.failNextBatch = false;
      return statements.map(() => ({ success: false, meta: {} }));
    }

    return Promise.all(statements.map((statement) => statement.run()));
  }

  first(query: string, values: unknown[]): ArticleRow | StatsRow | VoteRow | null {
    const articleKey = `${values[0]}:${values[1]}`;
    if (query.includes("FROM content_articles")) {
      return this.articles.get(articleKey) ?? null;
    }
    if (query.includes("FROM article_stats")) {
      return this.stats.get(articleKey) ?? null;
    }
    if (query.includes("FROM article_rating_votes")) {
      return this.votes.get(`${values[0]}:${values[1]}:${values[2]}`) ?? null;
    }
    throw new Error(`Unsupported first query: ${query}`);
  }

  run(query: string, values: unknown[]): void {
    if (query.includes("INSERT INTO article_stats")) {
      const key = `${values[0]}:${values[1]}`;
      if (!this.stats.has(key)) {
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
      return;
    }

    if (query.includes("INSERT INTO article_rating_votes")) {
      const key = `${values[0]}:${values[1]}:${values[2]}`;
      if (this.votes.has(key)) {
        throw new Error("UNIQUE constraint failed");
      }
      this.votes.set(key, {
        site_id: values[0] as string,
        article_id: values[1] as string,
        visitor_id: values[2] as string,
        value: values[3] as number,
        created_at_ms: values[4] as number,
        updated_at_ms: values[5] as number,
      });
      return;
    }

    if (query.includes("UPDATE article_rating_votes")) {
      const key = `${values[2]}:${values[3]}:${values[4]}`;
      const vote = this.votes.get(key);
      if (vote) {
        vote.value = values[0] as number;
        vote.updated_at_ms = values[1] as number;
      }
      return;
    }

    if (query.includes("rating_sum = rating_sum -")) {
      const stats = this.stats.get(`${values[3]}:${values[4]}`);
      if (stats) {
        stats.rating_sum = stats.rating_sum - (values[0] as number) + (values[1] as number);
        stats.updated_at_ms = values[2] as number;
      }
      return;
    }

    if (query.includes("rating_sum = rating_sum +")) {
      const stats = this.stats.get(`${values[2]}:${values[3]}`);
      if (stats) {
        stats.rating_sum += values[0] as number;
        stats.rating_count += 1;
        stats.updated_at_ms = values[1] as number;
      }
      return;
    }

    throw new Error(`Unsupported run query: ${query}`);
  }
}

describe("rating service", () => {
  it("handles first vote and boundary rating 1", async () => {
    const db = new RatingDb();
    const response = await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 1, 10);

    expect(response).toEqual({ ratingValue: 1, ratingCount: 1, myRating: 1 });
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_sum).toBe(1);
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_count).toBe(1);
  });

  it("updates an existing vote and keeps rating_count unchanged", async () => {
    const db = new RatingDb();
    await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 3, 10);
    const response = await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 5, 20);

    expect(response).toEqual({ ratingValue: 5, ratingCount: 1, myRating: 5 });
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_sum).toBe(5);
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_count).toBe(1);
    expect(db.votes.size).toBe(1);
  });

  it("handles repeated same-value vote without changing aggregates", async () => {
    const db = new RatingDb();
    await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 4, 10);
    const response = await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 4, 20);

    expect(response).toEqual({ ratingValue: 4, ratingCount: 1, myRating: 4 });
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_sum).toBe(4);
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_count).toBe(1);
  });

  it("handles two visitors and boundary rating 5", async () => {
    const db = new RatingDb();
    await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 1, 10);
    const response = await submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-b", 5, 20);

    expect(response).toEqual({ ratingValue: 3, ratingCount: 2, myRating: 5 });
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_sum).toBe(6);
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_count).toBe(2);
  });

  it("rejects ratings below 1, above 5, malformed payloads and unknown fields", () => {
    expect(() => parseRatingRequest({ value: 0 })).toThrow("Request body failed validation.");
    expect(() => parseRatingRequest({ value: 6 })).toThrow("Request body failed validation.");
    expect(() => parseRatingRequest({ value: "5" })).toThrow("Request body failed validation.");
    expect(() => parseRatingRequest({ value: 5, visitorId: "x" })).toThrow("Request body contains unknown fields.");
  });

  it("rejects unknown or disabled articles before vote/aggregate mutation", async () => {
    const db = new RatingDb();
    await expect(submitRating(db, "tragarze-pl", "missing", "visitor-a", 5, 10)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
    await expect(submitRating(db, "tragarze-pl", "disabled", "visitor-a", 5, 10)).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
    expect(db.votes.size).toBe(0);
    expect(db.stats.size).toBe(0);
  });

  it("does not desynchronize vote and aggregate when atomic batch fails", async () => {
    const db = new RatingDb();
    db.failNextBatch = true;

    await expect(submitRating(db, "tragarze-pl", "art-tragarze-001", "visitor-a", 5, 10)).rejects.toMatchObject({
      status: 500,
      code: "INTERNAL_ERROR",
    });

    expect(db.votes.size).toBe(0);
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_sum).toBe(0);
    expect(db.stats.get("tragarze-pl:art-tragarze-001")?.rating_count).toBe(0);
  });
});
