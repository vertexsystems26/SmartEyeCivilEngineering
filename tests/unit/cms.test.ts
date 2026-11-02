import { describe, expect, it } from "vitest";
import { missingTranslations, slugify, validate } from "@/admin/schema/helpers";
import { aboutSchema, collectionSchemas, projectsSchema, servicesSchema } from "@/admin/schemas";
import { checkUpload, safeBaseName } from "@/lib/server/uploads";
import * as seed from "@/seed/data";

const bytes = (...values: (number | string)[]) =>
  new Uint8Array(values.flatMap((v) => (typeof v === "string" ? [...v].map((c) => c.charCodeAt(0)) : [v])));

describe("upload policy", () => {
  it("accepts a real PNG and JPEG", () => {
    expect(checkUpload("plan.png", bytes(0x89, "PNG", 13, 10)).kind).toBe("image");
    expect(checkUpload("Photo.JPEG", bytes(0xff, 0xd8, 0xff, 0xe0)).ext).toBe("jpg");
  });

  it("accepts GLB models and PDFs by signature", () => {
    expect(checkUpload("tour.glb", bytes("glTF", 2, 0, 0, 0)).kind).toBe("model");
    expect(checkUpload("note.pdf", bytes("%PDF-1.7")).kind).toBe("document");
  });

  it("refuses SVG, executables and renamed files", () => {
    expect(() => checkUpload("logo.svg", bytes("<svg"))).toThrow(/Format non accepté/);
    expect(() => checkUpload("virus.exe", bytes("MZ"))).toThrow(/Format non accepté/);
    expect(() => checkUpload("fake.png", bytes("%PDF-1.7"))).toThrow(/ne correspond pas/);
  });

  it("refuses models over 30 MB", () => {
    const big = new Uint8Array(31 * 1024 * 1024);
    big.set(bytes("glTF"));
    expect(() => checkUpload("big.glb", big)).toThrow(/trop lourd/);
  });

  it("builds safe file names", () => {
    expect(safeBaseName("Façade Nord (v2).JPG")).toBe("facade-nord-v2");
    expect(safeBaseName("../../etc/passwd.png")).toBe("passwd");
    expect(safeBaseName("...")).toBe("fichier");
  });
});

describe("schemas", () => {
  it("slugify strips accents and punctuation", () => {
    expect(slugify("Étude de structure : béton armé !")).toBe("etude-de-structure-beton-arme");
  });

  it("flags required French fields left empty", () => {
    const issues = validate(
      servicesSchema.tabs.flatMap((t) => t.fields),
      servicesSchema.defaults(),
    );
    expect(issues.map((i) => i.path)).toEqual(expect.arrayContaining(["title", "summary"]));
  });

  it("detects missing English translations", () => {
    const data = { ...projectsSchema.defaults(), title: { fr: "Tour", en: "" } };
    expect(
      missingTranslations(
        projectsSchema.tabs.flatMap((t) => t.fields),
        data,
      ),
    ).toContain("Titre");
  });

  it("every schema has defaults for all its top-level fields", () => {
    for (const schema of [...collectionSchemas, aboutSchema]) {
      const defaults = schema.defaults();
      for (const field of schema.tabs.flatMap((t) => t.fields)) {
        expect(defaults, `${schema.slug}.${field.name}`).toHaveProperty(field.name);
      }
    }
  });
});

describe("seed data honesty (brief §2)", () => {
  const SECE_START = 2020 * 12 + 12;
  const monthIndex = (period: string) => {
    const m = period.match(/^(?:(\d{2})\/)?(\d{4})$/);
    return m ? Number(m[2]) * 12 + Number(m[1] ?? 1) : null;
  };

  it("projects finished before 12/2020 are labelled as the engineer's experience", () => {
    for (const { id, data } of seed.projects) {
      const end = monthIndex(String(data.periodEnd));
      if (end !== null && end < SECE_START) expect(data.context, id).toBe("engineer-experience");
    }
  });

  it("projects of the engineer's experience never claim to be S.E.C.E work", () => {
    for (const { id, data } of seed.projects.filter((p) => p.data.context === "engineer-experience")) {
      expect(data.employer, `${id} needs the employer of the time`).not.toBe("");
    }
  });

  it("slugs are unique per language", () => {
    for (const list of [seed.projects, seed.services, seed.posts, seed.categories]) {
      for (const lang of ["fr", "en"] as const) {
        const slugs = list.map((item) => (item.data.slug as { fr: string; en: string })[lang]);
        expect(new Set(slugs).size).toBe(slugs.length);
      }
    }
  });

  it("relations point to existing documents", () => {
    const categoryIds = new Set(seed.categories.map((c) => c.id));
    const serviceIds = new Set(seed.services.map((s) => s.id));
    for (const { id, data } of seed.projects) {
      for (const c of data.categories) expect(categoryIds.has(c), `${id} → ${c}`).toBe(true);
      for (const s of data.services) expect(serviceIds.has(s), `${id} → ${s}`).toBe(true);
    }
  });

  it("projects with missing facts are drafts or flagged to complete", () => {
    for (const { id, data } of seed.projects) {
      if (!data.summary.fr) expect(data.status, id).toBe("draft");
      expect(data.toComplete.length, id).toBeGreaterThan(0);
    }
  });

  it("memberships are not published until validated by the client", () => {
    expect(seed.about.memberships.every((m) => m.validated === false)).toBe(true);
  });

  it("the six launch articles are empty drafts (no invented text)", () => {
    expect(seed.posts).toHaveLength(6);
    for (const { data } of seed.posts) {
      expect(data.status).toBe("draft");
      expect(data.body).toEqual({ fr: null, en: null });
    }
  });
});
