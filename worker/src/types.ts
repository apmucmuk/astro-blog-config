export type AppEnv = "development" | "preview" | "production";

export type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
  meta: Record<string, unknown>;
};

export type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>() => Promise<T | null>;
  run: <T = unknown>() => Promise<D1Result<T>>;
  all: <T = unknown>() => Promise<D1Result<T>>;
};

export type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
  batch?: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
};

export type Env = {
  DB: D1Database;
  APP_ENV: AppEnv;
  SITE_ID: string;
  ALLOWED_ORIGIN: string;
  POPULARITY_WINDOW_DAYS: string;
  VISITOR_COOKIE_NAME: string;
  RATE_LIMIT_RATINGS?: string;
  RATE_LIMIT_COMMENTS?: string;
  TURNSTILE_MODE?: "mock" | "production";
  TURNSTILE_SECRET_KEY?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};
