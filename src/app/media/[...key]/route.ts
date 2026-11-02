import { getObject } from "@/lib/server/r2";

/*
 * Public media delivery from R2. Keys embed a content hash, so responses are
 * cached for a year at the edge and in browsers.
 */
export async function GET(request: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!/^(images|models|documents)\/[\w/.-]+$/.test(key)) return new Response("Not found", { status: 404 });

  const range = request.headers.get("range");
  const upstream = await getObject(key, { headers: range ? { range } : undefined });
  if (upstream.status === 404) return new Response("Not found", { status: 404 });
  if (!upstream.ok && upstream.status !== 206) return new Response("Upstream error", { status: 502 });

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
    "accept-ranges": "bytes",
  });
  for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
