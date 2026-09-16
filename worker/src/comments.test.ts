import { describe, expect, it } from "vitest";
import {
  createComment,
  deleteComment,
  listComments,
  markHelpful,
  moderateComment,
  parseCreateCommentRequest,
  reportComment,
} from "./comments";
import type { D1Database, D1PreparedStatement, D1Result, Env } from "./types";

type Row = Record<string, any>;

class Statement implements D1PreparedStatement {
  private values: unknown[] = [];
  constructor(private readonly db: CommentsDb, private readonly query: string) {}
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
    return { success: true, meta: {}, results: this.db.all(this.query, this.values) as T[] };
  }
}

class CommentsDb implements D1Database {
  articles = new Map<string, Row>();
  stats = new Map<string, Row>();
  comments = new Map<string, Row>();
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
  first(query: string, values: unknown[]): Row | null {
    if (query.includes("FROM content_articles")) return this.articles.get(`${values[0]}:${values[1]}`) ?? null;
    if (query.includes("FROM article_stats")) return this.stats.get(`${values[0]}:${values[1]}`) ?? null;
    if (query.includes("FROM comments") && query.includes("WHERE id = ?")) return this.comments.get(values[0] as string) ?? null;
    return null;
  }
  all(query: string, values: unknown[]): Row[] {
    if (!query.includes("FROM comments")) return [];
    const siteId = values[0] as string;
    const articleId = values[1] as string;
    const excluded = new Set<string>();
    let index = 2;
    if (query.includes("id NOT IN")) {
      const match = query.match(/id NOT IN \(([^)]+)\)/);
      const count = match ? match[1].split(",").length : 0;
      for (let i = 0; i < count; i += 1) excluded.add(values[index++] as string);
    }
    let cursor: { createdAt: number; id: string } | null = null;
    if (query.includes("created_at_ms < ?")) {
      cursor = { createdAt: values[index] as number, id: values[index + 2] as string };
      index += 3;
    }
    const limit = values[index] as number;
    return [...this.comments.values()]
      .filter((row) => row.site_id === siteId && row.article_id === articleId && row.status === "published")
      .filter((row) => !excluded.has(row.id))
      .filter((row) => !cursor || row.created_at_ms < cursor.createdAt || (row.created_at_ms === cursor.createdAt && row.id < cursor.id))
      .sort((a, b) => b.created_at_ms - a.created_at_ms || String(b.id).localeCompare(String(a.id)))
      .slice(0, limit);
  }
  run(query: string, values: unknown[]): void {
    if (query.includes("INSERT INTO article_stats")) {
      const key = `${values[0]}:${values[1]}`;
      if (!this.stats.has(key)) {
        this.stats.set(key, { site_id: values[0], article_id: values[1], reads: 0, comments_count: 0, rating_sum: 0, rating_count: 0, updated_at_ms: values[2] });
      }
      return;
    }
    if (query.includes("INSERT INTO comments")) {
      const row = {
        id: values[0] as string,
        site_id: values[1] as string,
        article_id: values[2] as string,
        parent_id: values[3] as string | null,
        author_name: values[4] as string,
        body: values[5] as string,
        status: values[6] as string,
        moderation_reason: values[7] as string | null,
        reports_count: 0,
        helpful_count: 0,
        link_rel: values[8] as string | null,
        created_at_ms: values[9] as number,
      };
      this.comments.set(row.id, row);
      if (row.status === "published") this.stats.get(`${row.site_id}:${row.article_id}`)!.comments_count += 1;
      return;
    }
    if (query.startsWith("UPDATE comments") && query.includes("SET status")) {
      const row = this.comments.get(values[4] as string);
      if (!row) return;
      const old = row.status;
      row.status = values[0];
      row.reports_count = values[1];
      row.helpful_count = values[2];
      row.link_rel = values[3];
      const stats = this.stats.get(`${row.site_id}:${row.article_id}`)!;
      if (old !== "published" && row.status === "published") stats.comments_count += 1;
      if (old === "published" && row.status !== "published") stats.comments_count -= 1;
      return;
    }
    if (query.startsWith("DELETE FROM comments")) {
      const row = this.comments.get(values[0] as string);
      if (row?.status === "published") this.stats.get(`${row.site_id}:${row.article_id}`)!.comments_count -= 1;
      this.comments.delete(values[0] as string);
      return;
    }
    if (query.includes("helpful_count = helpful_count + 1")) {
      const row = this.comments.get(values[0] as string);
      if (row?.status === "published") row.helpful_count += 1;
      return;
    }
    if (query.includes("reports_count = reports_count + 1")) {
      const row = this.comments.get(values[0] as string);
      if (row?.status === "published") row.reports_count += 1;
      return;
    }
  }
}

const env: Env = {
  APP_ENV: "development",
  SITE_ID: "tragarze-pl",
  ALLOWED_ORIGIN: "https://tragarze.pl",
  POPULARITY_WINDOW_DAYS: "7",
  VISITOR_COOKIE_NAME: "tragarze_vid",
  TURNSTILE_MODE: "mock",
  DB: new CommentsDb(),
};

function fresh() {
  return { ...env, DB: new CommentsDb() };
}

describe("comments stage 7", () => {
  it("classifies 0 links as published, 1 link as pending and 2+ links as pending", async () => {
    const local = fresh();
    const published = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "Dobry wpis", turnstileToken: "test-pass" }, 10);
    const one = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "Zobacz https://example.com", turnstileToken: "test-pass" }, 20);
    const two = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "https://a.test https://b.test", turnstileToken: "test-pass" }, 30);
    expect(published.status).toBe("published");
    expect(one.status).toBe("pending");
    expect(two.status).toBe("pending");
    expect((local.DB as CommentsDb).stats.get("tragarze-pl:art-tragarze-001")?.comments_count).toBe(1);
  });

  it("validates body limits, malformed payload, Turnstile failure and missing/disabled article without writes", async () => {
    expect(() => parseCreateCommentRequest({ articleId: "art-tragarze-001", name: "Jan", body: "x".repeat(1500), turnstileToken: "test-pass" })).not.toThrow();
    expect(() => parseCreateCommentRequest({ articleId: "art-tragarze-001", name: "Jan", body: "x".repeat(1501), turnstileToken: "test-pass" })).toThrow();
    expect(() => parseCreateCommentRequest({ articleId: "art-tragarze-001", name: "Jan", body: "ok", turnstileToken: "test-pass", extra: true })).toThrow();
    const local = fresh();
    await expect(createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "ok", turnstileToken: "bad" }, 10)).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(createComment(local.DB, local, { articleId: "missing", name: "Jan", body: "ok", turnstileToken: "test-pass" }, 10)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(createComment(local.DB, local, { articleId: "disabled", name: "Jan", body: "ok", turnstileToken: "test-pass" }, 10)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((local.DB as CommentsDb).comments.size).toBe(0);
  });

  it("normalizes reply-to-reply to the root parent", async () => {
    const local = fresh();
    const root = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "A", body: "root", turnstileToken: "test-pass" }, 10);
    const rootId = root.status === "published" ? root.comment.id : "";
    const reply = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "B", body: "reply", parentId: rootId, turnstileToken: "test-pass" }, 20);
    const replyId = reply.status === "published" ? reply.comment.id : "";
    const nested = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "C", body: "nested", parentId: replyId, turnstileToken: "test-pass" }, 30);
    expect(nested.status === "published" ? nested.comment.parentId : null).toBe(rootId);
  });

  it("uses keyset pagination and excludes featured ids before limit, including empty featured list", async () => {
    const local = fresh();
    for (let i = 0; i < 4; i += 1) {
      await createComment(local.DB, local, { articleId: "art-tragarze-001", name: `Jan${i}`, body: `body ${i}`, turnstileToken: "test-pass" }, 10 + i);
    }
    const first = await listComments(local.DB, local, new URL("https://api.test/v1/comments?articleId=art-tragarze-001&limit=2&excludeIds="));
    expect(first.items).toHaveLength(2);
    const second = await listComments(local.DB, local, new URL(`https://api.test/v1/comments?articleId=art-tragarze-001&limit=2&cursor=${encodeURIComponent(first.nextCursor ?? "")}`));
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(4);
    const excluded = await listComments(local.DB, local, new URL(`https://api.test/v1/comments?articleId=art-tragarze-001&limit=3&excludeIds=${first.items[0].id}`));
    expect(excluded.items.map((item) => item.id)).not.toContain(first.items[0].id);
  });

  it("keeps comments_count consistent across moderation and delete transitions", async () => {
    const local = fresh();
    const pending = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "https://example.com", turnstileToken: "test-pass" }, 10);
    const pendingId = [...(local.DB as CommentsDb).comments.keys()][0];
    expect(pending.status).toBe("pending");
    await expect(moderateComment(local.DB, pendingId, { status: "published" })).rejects.toThrow();
    await moderateComment(local.DB, pendingId, { status: "published", linkRel: "nofollow" });
    await Promise.all([
      moderateComment(local.DB, pendingId, { status: "published", linkRel: "nofollow" }),
      moderateComment(local.DB, pendingId, { status: "published", linkRel: "nofollow" }),
    ]);
    expect((local.DB as CommentsDb).stats.get("tragarze-pl:art-tragarze-001")?.comments_count).toBe(1);
    await deleteComment(local.DB, pendingId);
    expect((local.DB as CommentsDb).stats.get("tragarze-pl:art-tragarze-001")?.comments_count).toBe(0);
    const pending2 = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "https://example.com", turnstileToken: "test-pass" }, 20);
    expect(pending2.status).toBe("pending");
    await deleteComment(local.DB, [...(local.DB as CommentsDb).comments.keys()][0]);
    expect((local.DB as CommentsDb).stats.get("tragarze-pl:art-tragarze-001")?.comments_count).toBe(0);
  });

  it("supports helpful and report without changing comments_count", async () => {
    const local = fresh();
    const created = await createComment(local.DB, local, { articleId: "art-tragarze-001", name: "Jan", body: "ok", turnstileToken: "test-pass" }, 10);
    const id = created.status === "published" ? created.comment.id : "";
    await markHelpful(local.DB, id);
    await reportComment(local.DB, id);
    const row = (local.DB as CommentsDb).comments.get(id)!;
    expect(row.helpful_count).toBe(1);
    expect(row.reports_count).toBe(1);
    expect((local.DB as CommentsDb).stats.get("tragarze-pl:art-tragarze-001")?.comments_count).toBe(1);
  });
});
