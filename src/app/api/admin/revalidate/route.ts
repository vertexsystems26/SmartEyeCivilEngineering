import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { REVALIDATABLE, cacheTag } from "@/lib/cms/collections";
import { AuthError, requireRole } from "@/lib/server/firebase-auth";

const Body = z.object({
  targets: z
    .array(z.object({ collection: z.enum(REVALIDATABLE), id: z.string().max(200).optional() }))
    .min(1)
    .max(20),
});

/**
 * Called by the back-office after a save: expires the cached data of the
 * touched collection/document so the next visit renders fresh content
 * (no stale copy is served: expire 0).
 */
export async function POST(request: Request) {
  try {
    await requireRole(request, ["admin", "editor"]);
    const parsed = Body.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Requête invalide." }, { status: 400 });

    const tags = new Set<string>();
    for (const { collection, id } of parsed.data.targets) {
      tags.add(cacheTag.collection(collection));
      if (id) tags.add(cacheTag.doc(collection, id));
    }
    for (const tag of tags) revalidateTag(tag, { expire: 0 });

    return NextResponse.json({ revalidated: [...tags] });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error(error);
    return NextResponse.json({ error: "Erreur de revalidation." }, { status: 500 });
  }
}
