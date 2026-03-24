/**
 * Cloudflare D1 Client
 *
 * Provides a unified interface for querying D1:
 * - Inside Workers/Pages: uses the bound DB binding directly
 * - Outside Workers (Next.js dev): uses the D1 REST API
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '';

interface D1QueryResult<T = Record<string, unknown>> {
  success: boolean;
  results: T[];
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
    changes: number;
    last_row_id: number | null;
  };
}

/**
 * Get a reference to the D1 database.
 * Returns the Workers binding if available, otherwise uses REST API wrapper.
 */
function getDB(env?: { DB?: unknown }): D1RestClient {
  // If running inside Workers with a bound DB, wrap it
  if (env?.DB) {
    return new D1BindingClient(env.DB as import('./env.d').D1Database);
  }
  // Fallback to REST API
  return new D1RestApiClient();
}

/** A prepared statement that can be bound with params and executed */
class D1PreparedStatementLike {
  private params: unknown[] = [];
  constructor(private client: D1RestClient, private sql: string) {}

  /** Bind positional params */
  bind(...args: unknown[]): D1PreparedStatementLike {
    this.params = args;
    return this;
  }

  /** Execute the statement */
  async run(): Promise<{ changes: number; lastRowId: number | null }> {
    return this.client.execute(this.sql, this.params);
  }
}

/** Abstract D1 client interface */
abstract class D1RestClient {
  abstract query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<D1QueryResult<T>>;
  abstract execute(sql: string, params?: unknown[]): Promise<{ changes: number; lastRowId: number | null }>;

  /** Create a prepared statement */
  prepare(sql: string): D1PreparedStatementLike {
    return new D1PreparedStatementLike(this, sql);
  }

  /** Run multiple statements sequentially */
  async batch(statements: D1PreparedStatementLike[]): Promise<void> {
    for (const stmt of statements) {
      await stmt.run();
    }
  }

  /** Query and return all rows */
  async all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await this.query<T>(sql, params);
    return result.results;
  }

  /** Query and return first row or null */
  async first<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.results[0] ?? null;
  }
}

/** Client that uses the Workers D1 binding directly */
class D1BindingClient extends D1RestClient {
  constructor(private db: import('./env.d').D1Database) {
    super();
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<D1QueryResult<T>> {
    const stmt = this.db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bound.all<T>();
    return {
      success: result.success,
      results: result.results,
      meta: {
        duration: result.meta.duration,
        rows_read: result.meta.rows_read,
        rows_written: result.meta.rows_written,
        changes: result.meta.changes,
        last_row_id: result.meta.last_row_id,
      },
    };
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastRowId: number | null }> {
    const stmt = this.db.prepare(sql);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt;
    const result = await bound.run();
    return { changes: result.meta.changes, lastRowId: result.meta.last_row_id };
  }
}

/** Client that uses the Cloudflare D1 REST API (for local dev / Next.js server) */
class D1RestApiClient extends D1RestClient {
  private baseUrl: string;

  constructor() {
    super();
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}`;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<D1QueryResult<T>> {
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !D1_DATABASE_ID) {
      console.warn('D1: Missing Cloudflare credentials, returning empty results');
      return { success: false, results: [], meta: { duration: 0, rows_read: 0, rows_written: 0, changes: 0, last_row_id: null } };
    }

    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ sql, params }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('D1 query error:', errorText);
        return { success: false, results: [], meta: { duration: 0, rows_read: 0, rows_written: 0, changes: 0, last_row_id: null } };
      }

      const data = await response.json() as { result: D1QueryResult<T>[] };
      // D1 REST API returns an array of results (one per statement)
      const firstResult = data.result?.[0];
      if (!firstResult) {
        return { success: true, results: [], meta: { duration: 0, rows_read: 0, rows_written: 0, changes: 0, last_row_id: null } };
      }
      return firstResult;
    } catch (error) {
      console.error('D1 query failed:', error);
      return { success: false, results: [], meta: { duration: 0, rows_read: 0, rows_written: 0, changes: 0, last_row_id: null } };
    }
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastRowId: number | null }> {
    const result = await this.query(sql, params);
    return { changes: result.meta.changes, lastRowId: result.meta.last_row_id };
  }
}

// ── Singleton ─────────────────────────────────────────────

let _db: D1RestClient | null = null;

/**
 * Get the D1 database client (singleton in server context).
 * Pass `env` when running inside Cloudflare Workers to use the bound binding.
 */
export function db(env?: { DB?: unknown }): D1RestClient {
  if (env?.DB) {
    // Always use fresh binding client when env is provided
    return getDB(env);
  }
  if (!_db) {
    _db = getDB();
  }
  return _db;
}

export type { D1QueryResult };
