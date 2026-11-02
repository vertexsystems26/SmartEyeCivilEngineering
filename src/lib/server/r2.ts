import "server-only";
import { AwsClient } from "aws4fetch";

/*
 * Media storage in Cloudflare R2 through its S3-compatible API.
 * One code path for `next dev` and the deployed Worker: the Worker needs the
 * R2_* values as secrets (wrangler secret put / dashboard → Variables).
 */
function config() {
  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_PUBLIC_BUCKET } = process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT || !R2_PUBLIC_BUCKET) {
    throw new Error("Stockage R2 non configuré (variables R2_*).");
  }
  return {
    client: new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: "s3",
      region: "auto",
    }),
    bucketUrl: `${R2_ENDPOINT.replace(/\/$/, "")}/${R2_PUBLIC_BUCKET}`,
  };
}

const objectUrl = (bucketUrl: string, key: string) =>
  `${bucketUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

export async function putObject(key: string, body: ArrayBuffer, contentType: string) {
  const { client, bucketUrl } = config();
  const res = await client.fetch(objectUrl(bucketUrl, key), {
    method: "PUT",
    body,
    headers: { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" },
  });
  if (!res.ok) throw new Error(`R2 PUT ${key} → ${res.status}`);
}

export async function getObject(key: string, init: { headers?: HeadersInit } = {}) {
  const { client, bucketUrl } = config();
  return client.fetch(objectUrl(bucketUrl, key), { method: "GET", headers: init.headers });
}

export async function deleteObject(key: string) {
  const { client, bucketUrl } = config();
  const res = await client.fetch(objectUrl(bucketUrl, key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE ${key} → ${res.status}`);
}
