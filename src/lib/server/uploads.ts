import "server-only";
import type { MediaKind } from "@/lib/cms/types";

/*
 * Upload policy (brief §7.5–7.6): allow-listed extensions, MIME type checked
 * against the file's real signature (magic bytes), size caps per kind.
 * SVG is refused on purpose (it can carry scripts).
 */
type Rule = { kind: MediaKind; mime: string; maxBytes: number; sniff: (b: Uint8Array) => boolean };

const MB = 1024 * 1024;
const ascii = (b: Uint8Array, start: number, text: string) =>
  [...text].every((ch, i) => b[start + i] === ch.charCodeAt(0));

const RULES: Record<string, Rule> = {
  jpg: {
    kind: "image",
    mime: "image/jpeg",
    maxBytes: 20 * MB,
    sniff: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  jpeg: {
    kind: "image",
    mime: "image/jpeg",
    maxBytes: 20 * MB,
    sniff: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  png: { kind: "image", mime: "image/png", maxBytes: 20 * MB, sniff: (b) => ascii(b, 1, "PNG") && b[0] === 0x89 },
  webp: {
    kind: "image",
    mime: "image/webp",
    maxBytes: 20 * MB,
    sniff: (b) => ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP"),
  },
  avif: { kind: "image", mime: "image/avif", maxBytes: 20 * MB, sniff: (b) => ascii(b, 4, "ftypavi") },
  glb: { kind: "model", mime: "model/gltf-binary", maxBytes: 30 * MB, sniff: (b) => ascii(b, 0, "glTF") },
  gltf: { kind: "model", mime: "model/gltf+json", maxBytes: 30 * MB, sniff: (b) => b[0] === 0x7b /* { */ },
  pdf: { kind: "document", mime: "application/pdf", maxBytes: 20 * MB, sniff: (b) => ascii(b, 0, "%PDF") },
};

export const ACCEPTED_EXTENSIONS = Object.keys(RULES);

export class UploadError extends Error {}

export function checkUpload(filename: string, bytes: Uint8Array) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const rule = RULES[ext];
  if (!rule) throw new UploadError(`Format non accepté (.${ext}). Formats : ${ACCEPTED_EXTENSIONS.join(", ")}.`);
  if (bytes.byteLength > rule.maxBytes) {
    throw new UploadError(
      `Fichier trop lourd : ${(bytes.byteLength / MB).toFixed(1)} Mo (maximum ${rule.maxBytes / MB} Mo).`,
    );
  }
  if (!rule.sniff(bytes)) throw new UploadError("Le contenu du fichier ne correspond pas à son extension.");
  return { ...rule, ext: ext === "jpeg" ? "jpg" : ext };
}

/** "Façade Nord (v2).JPG" → "facade-nord-v2" */
export function safeBaseName(filename: string) {
  const base = (filename.split(/[\\/]/).pop() ?? "").replace(/\.[^.]+$/, "");
  return (
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "fichier"
  );
}

export async function sha256(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
