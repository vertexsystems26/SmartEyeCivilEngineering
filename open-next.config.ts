import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/*
 * Rendered pages are cached in R2. Phase 2 adds a tag cache (D1) and a
 * Durable Object queue so that publishing in the back-office can call
 * revalidateTag() and refresh pages within seconds.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
