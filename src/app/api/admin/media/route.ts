import { NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/server/firebase-auth";
import { deleteObject, putObject } from "@/lib/server/r2";
import { UploadError, checkUpload, safeBaseName, sha256 } from "@/lib/server/uploads";

function errorResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof UploadError) return NextResponse.json({ error: error.message }, { status: 400 });
  console.error(error);
  return NextResponse.json({ error: "Erreur serveur pendant l'envoi." }, { status: 500 });
}

/**
 * Stores one file in R2 under a content-addressed, human-readable key
 * (images/2026/11/facade-nord-3fa2b1c9.jpg). The Firestore `media` document
 * is written by the client afterwards, under its own permissions.
 */
export async function POST(request: Request) {
  try {
    await requireRole(request, ["admin", "editor"]);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new UploadError("Aucun fichier reçu.");

    const buffer = await file.arrayBuffer();
    const rule = checkUpload(file.name, new Uint8Array(buffer));
    const hash = await sha256(buffer);
    const now = new Date();
    const folder = `${rule.kind}s/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const key = `${folder}/${safeBaseName(file.name)}-${hash.slice(0, 8)}.${rule.ext}`;

    await putObject(key, buffer, rule.mime);

    return NextResponse.json({
      key,
      url: `/media/${key}`,
      kind: rule.kind,
      contentType: rule.mime,
      size: buffer.byteLength,
      hash,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(request, ["admin", "editor"]);
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!/^(images|models|documents)\/[\w/.-]+$/.test(key)) throw new UploadError("Clé de fichier invalide.");
    await deleteObject(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
