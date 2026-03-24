/**
 * Cloudflare Workers Environment Bindings
 * Shared type definitions for all Cloudflare modules.
 *
 * When running inside Workers/Pages, these are injected by the runtime.
 * When running in Next.js dev, we fall back to REST API calls.
 */

export interface Env {
  /** Cloudflare D1 SQLite database */
  DB: D1Database;
  /** Cloudflare KV namespace for caching */
  CACHE: KVNamespace;
  /** Cloudflare R2 bucket for image storage */
  IMAGES: R2Bucket;
  /** Cloudflare Workers AI */
  AI: Ai;
  /** Cloudflare Vectorize index */
  VECTORIZE: VectorizeIndex;
}

// ── D1 Types ──────────────────────────────────────────────

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
  dump(): Promise<ArrayBuffer>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(column?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
  run(): Promise<D1Result>;
}

export interface D1Result<T = unknown> {
  success: boolean;
  results: T[];
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
    last_row_id: number | null;
    changed_db: boolean;
    changes: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// ── KV Types ──────────────────────────────────────────────

export interface KVNamespace {
  get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expiration?: number; expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<KVListResult>;
}

export interface KVListResult {
  keys: { name: string; expiration?: number }[];
  list_complete: boolean;
  cursor?: string;
}

// ── R2 Types ──────────────────────────────────────────────

export interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | string | Blob, options?: R2PutOptions): Promise<R2Object>;
  delete(key: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
  head(key: string): Promise<R2Object | null>;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  body?: ReadableStream;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  blob(): Promise<Blob>;
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
  delimiter?: string;
  include?: ('httpMetadata' | 'customMetadata')[];
}

export interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

// ── AI / Vectorize Types ──────────────────────────────────

export interface Ai {
  run(model: string, input: unknown): Promise<unknown>;
}

export interface VectorizeIndex {
  query(vector: number[], options?: VectorizeQueryOptions): Promise<VectorizeMatches>;
  upsert(vectors: VectorizeVector[]): Promise<VectorizeMutationResult>;
  getByIds(ids: string[]): Promise<VectorizeVector[]>;
  deleteByIds(ids: string[]): Promise<VectorizeMutationResult>;
}

export interface VectorizeQueryOptions {
  topK?: number;
  namespace?: string;
  returnValues?: boolean;
  returnMetadata?: 'none' | 'indexed' | 'all';
  filter?: Record<string, unknown>;
}

export interface VectorizeMatches {
  matches: VectorizeMatch[];
  count: number;
}

export interface VectorizeMatch {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorizeVector {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
  namespace?: string;
}

export interface VectorizeMutationResult {
  count: number;
  ids: string[];
}
