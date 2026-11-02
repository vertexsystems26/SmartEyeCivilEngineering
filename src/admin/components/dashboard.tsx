"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { MediaDoc } from "@/lib/cms/types";
import { can, useProfile } from "../lib/auth";
import { getDocument, listDocs, type AnyDoc } from "../lib/data";
import { importSeed } from "../lib/seed";
import { allFields, docTitle, localizedText, missingTranslations } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import {
  aboutSchema,
  categoriesSchema,
  collectionSchemas,
  postsSchema,
  projectsSchema,
  servicesSchema,
} from "../schemas";
import { errorMessage, useFeedback } from "./feedback";
import { Skeleton, StatusPill } from "./ui";

type Data = { bySchema: { schema: CollectionSchema; docs: AnyDoc[] }[]; media: MediaDoc[]; about: AnyDoc | null };

async function fetchDashboard(): Promise<Data> {
  const [bySchema, media, about] = await Promise.all([
    Promise.all(collectionSchemas.map(async (schema) => ({ schema, docs: await listDocs(schema.collection) }))),
    listDocs("media") as Promise<unknown> as Promise<MediaDoc[]>,
    getDocument(aboutSchema),
  ]);
  return { bySchema, media, about };
}

export function Dashboard() {
  const { profile } = useProfile();
  const { notify, confirm } = useFeedback();
  const [data, setData] = useState<Data | null>(null);
  const [denied, setDenied] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const onError = useCallback(
    (error: unknown) => {
      if ((error as { code?: string }).code === "permission-denied") setDenied(true);
      else notify(errorMessage(error), "error");
    },
    [notify],
  );

  useEffect(() => {
    if (can(profile.role, "content")) fetchDashboard().then(setData).catch(onError);
  }, [onError, profile.role]);

  if (!can(profile.role, "content")) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-h2">Bonjour</h1>
        <p>La réception des messages et des demandes de devis arrive avec la phase 3.</p>
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex flex-col gap-4 rounded-card border border-ink bg-paper p-6">
        <h1 className="text-h3">Accès à la base de données refusé</h1>
        <p>
          Les règles de sécurité Firestore ne sont probablement pas encore publiées. Dans la console Firebase, ouvrez
          Firestore → Règles, collez le contenu du fichier <code className="font-mono">firestore.rules</code> du projet,
          puis cliquez sur Publier.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const docsOf = (schema: CollectionSchema) => data.bySchema.find((b) => b.schema === schema)?.docs ?? [];
  const isEmpty = docsOf(servicesSchema).length === 0 && docsOf(projectsSchema).length === 0;

  const todo = data.bySchema.flatMap(({ schema, docs }) =>
    docs.filter((d) => (d.toComplete as string[] | undefined)?.length).map((d) => ({ schema, doc: d })),
  );
  if (data.about && (data.about.toComplete as string[] | undefined)?.length)
    todo.push({ schema: aboutSchema, doc: data.about });

  const missingEn = data.bySchema.flatMap(({ schema, docs }) =>
    docs
      .filter((d) => d.status === "published" && missingTranslations(allFields(schema), d).length)
      .map((d) => ({ schema, doc: d })),
  );
  const noAlt = data.media.filter((m) => m.kind === "image" && !m.alt?.fr);
  const noDescription = data.bySchema
    .filter(({ schema }) => schema !== categoriesSchema)
    .flatMap(({ schema, docs }) =>
      docs
        .filter((d) => d.status === "published")
        .filter(
          (d) =>
            !localizedText((d.seo as { description?: unknown } | undefined)?.description) &&
            !localizedText(d.summary) &&
            !localizedText(d.excerpt),
        )
        .map((d) => ({ schema, doc: d })),
    );
  const recent = data.bySchema
    .flatMap(({ schema, docs }) => docs.map((doc) => ({ schema, doc })))
    .sort((a, b) => Number(b.doc.updatedAt ?? 0) - Number(a.doc.updatedAt ?? 0))
    .slice(0, 6);

  const href = (schema: CollectionSchema, d: AnyDoc) =>
    schema.singleton ? `/admin/${schema.slug}` : `/admin/${schema.slug}/${d.id}`;

  async function runSeed() {
    const ok = await confirm({
      title: "Importer les données de référence ?",
      message: (
        <p>
          Services, projets, catégories, page À propos et 6 brouillons d&apos;articles issus de la brochure et du CV.
          Les contenus existants ne sont jamais écrasés.
        </p>
      ),
      confirmLabel: "Importer",
    });
    if (!ok) return;
    setSeeding(true);
    try {
      const report = await importSeed(profile.email);
      notify(`${report.created} contenu(s) importé(s)${report.skipped ? `, ${report.skipped} déjà présent(s)` : ""}.`);
      setData(await fetchDashboard());
    } catch (error) {
      notify(errorMessage(error), "error");
    } finally {
      setSeeding(false);
    }
  }

  const stat = (schema: CollectionSchema) => {
    const docs = docsOf(schema);
    const published = docs.filter((d) => d.status === "published").length;
    return (
      <Link
        href={`/admin/${schema.slug}`}
        className="flex flex-col gap-1 rounded-card border border-line bg-paper p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
      >
        <span className="label-mono text-pine-700">{schema.labels.plural}</span>
        <span className="font-display text-4xl font-bold">{published}</span>
        <span className="text-small text-pine-700">publié(s) · {docs.length - published} brouillon(s)</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="label-mono text-pine-700">Tableau de bord</p>
        <h1 className="text-h2">Bonjour{profile.displayName ? ` ${profile.displayName}` : ""}</h1>
      </header>

      {isEmpty && profile.role === "admin" ? (
        <section className="flex flex-col gap-3 rounded-card border border-pine-600 bg-paper p-6">
          <h2 className="text-h3">Démarrer avec les données de référence</h2>
          <p className="measure">
            Importez en un clic les 8 services, les projets de référence, le parcours de l&apos;ingénieur conseil et les
            6 brouillons d&apos;articles prévus. Les informations manquantes sont signalées « À compléter ».
          </p>
          <Button onClick={runSeed} disabled={seeding} className="self-start">
            {seeding ? "Import en cours…" : "Importer les données de référence"}
          </Button>
        </section>
      ) : null}

      <section aria-label="Chiffres" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat(projectsSchema)}
        {stat(servicesSchema)}
        {stat(postsSchema)}
        <Link
          href="/admin/medias"
          className="flex flex-col gap-1 rounded-card border border-line bg-paper p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
        >
          <span className="label-mono text-pine-700">Médiathèque</span>
          <span className="font-display text-4xl font-bold">{data.media.length}</span>
          <span className="text-small text-pine-700">fichier(s) · {noAlt.length} sans texte alternatif</span>
        </Link>
      </section>

      <section aria-labelledby="shortcuts" className="flex flex-col gap-3">
        <h2 id="shortcuts" className="label-mono text-pine-700">
          Raccourcis
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/projets/nouveau" className={buttonVariants()}>
            + Nouveau projet
          </Link>
          <Link href="/admin/actualites/nouveau" className={buttonVariants({ variant: "secondary" })}>
            + Nouvel article
          </Link>
          <Link href="/admin/medias" className={buttonVariants({ variant: "secondary" })}>
            Ajouter des médias
          </Link>
          <Link href="/admin/a-propos" className={buttonVariants({ variant: "secondary" })}>
            Modifier la page À propos
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="alerts" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5">
          <h2 id="alerts" className="text-h3">
            Alertes SEO et qualité
          </h2>
          <ul className="flex flex-col gap-3 text-small">
            <Alert count={noAlt.length} ok="Toutes les images ont un texte alternatif." href="/admin/medias">
              image(s) sans texte alternatif
            </Alert>
            <Alert count={noDescription.length} ok="Toutes les pages publiées ont une description.">
              page(s) publiée(s) sans description pour Google
            </Alert>
            <Alert count={missingEn.length} ok="Tous les contenus publiés sont traduits en anglais.">
              contenu(s) publié(s) avec une traduction anglaise incomplète
            </Alert>
          </ul>
          {missingEn.length ? (
            <ul className="flex flex-col gap-1 border-t border-line pt-3 text-small">
              {missingEn.slice(0, 6).map(({ schema, doc }) => (
                <li key={`${schema.slug}-${doc.id}`}>
                  <Link href={href(schema, doc)} className="link">
                    {docTitle(schema, doc)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section aria-labelledby="todo" className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5">
          <h2 id="todo" className="text-h3">
            À compléter <span className="label-mono text-pine-700">({todo.length})</span>
          </h2>
          {todo.length ? (
            <ul className="flex flex-col divide-y divide-line text-small">
              {todo.slice(0, 8).map(({ schema, doc }) => (
                <li key={`${schema.slug}-${doc.id}`} className="flex items-center gap-3 py-2">
                  <Link href={href(schema, doc)} className="link flex-1 truncate">
                    {schema.singleton ? schema.labels.plural : docTitle(schema, doc)}
                  </Link>
                  <span className="label-mono text-pine-700">{(doc.toComplete as string[]).length}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-small">Rien à compléter ✓</p>
          )}
        </section>
      </div>

      <section aria-labelledby="recent" className="flex flex-col gap-3">
        <h2 id="recent" className="text-h3">
          Derniers contenus modifiés
        </h2>
        {recent.length ? (
          <ul className="divide-y divide-line rounded-card border border-line bg-paper">
            {recent.map(({ schema, doc }) => (
              <li key={`${schema.slug}-${doc.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 text-small">
                <span className="label-mono w-24 text-pine-700">{schema.labels.plural}</span>
                <Link href={href(schema, doc)} className="link min-w-0 flex-1 truncate">
                  {docTitle(schema, doc)}
                </Link>
                <StatusPill status={doc.status} />
                <span className="text-pine-700">
                  {doc.updatedAt ? new Date(Number(doc.updatedAt)).toLocaleDateString("fr-FR") : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-pine-700">Aucun contenu pour l&apos;instant.</p>
        )}
      </section>
    </div>
  );
}

function Alert({ count, ok, href, children }: { count: number; ok: string; href?: string; children: ReactNode }) {
  if (!count) return <li>✓ {ok}</li>;
  const text = (
    <>
      <strong>{count}</strong> {children}
    </>
  );
  return (
    <li>
      ⚠{" "}
      {href ? (
        <Link href={href} className="link">
          {text}
        </Link>
      ) : (
        text
      )}
    </li>
  );
}
