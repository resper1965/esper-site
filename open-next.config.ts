import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

/**
 * Configuração do adaptador OpenNext para Cloudflare Workers.
 *
 * O cache incremental usa o KV declarado em wrangler.toml como
 * NEXT_CACHE_WORKERS_KV. Antes estava como "dummy", o que desligava ISR por
 * completo — cada requisição renderizava do zero e batia no D1.
 *
 * Docs: https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
