/*
 * Content model shared by the back-office (writes) and the public site
 * (reads). Firestore documents follow these shapes.
 */

export type Locale = "fr" | "en";
export type Localized<T = string> = { fr: T; en: T };

/** Tiptap / ProseMirror JSON document. */
export type RichText = { type: "doc"; content?: RichNode[] };
export type RichNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

export type Status = "draft" | "published";
export type Role = "admin" | "editor" | "sales";

/** Reference to a `media` document, denormalised for rendering without a join. */
export type MediaRef = {
  id: string;
  url: string;
  width?: number;
  height?: number;
  /** Focal point in % (0–100) used for object-position. */
  focal?: { x: number; y: number };
};

export type GalleryItem = { media: MediaRef | null; caption: Localized };

export type Seo = {
  title: Localized;
  description: Localized;
  image: MediaRef | null;
  noindex: boolean;
};

/** Fields every editable document carries. */
export type BaseDoc = {
  id: string;
  status: Status;
  /** Internal checklist shown only in the back-office ("À compléter"). */
  toComplete: string[];
  updatedAt?: number;
  updatedBy?: string;
  publishedAt?: number;
};

export type ProjectContext = "sece" | "collaboration" | "engineer-experience";

export type Hotspot = { label: Localized; text: Localized; position: string; normal: string };

export type ProjectDoc = BaseDoc & {
  title: Localized;
  slug: Localized;
  featured: boolean;
  order: number;
  categories: string[];
  summary: Localized;
  context: ProjectContext;
  partner: string;
  employer: string;
  client: string;
  country: string;
  city: Localized;
  periodStart: string;
  periodEnd: string;
  area: number | null;
  levels: Localized;
  structureType: string[];
  role: Localized;
  services: string[];
  standards: string[];
  software: string[];
  partners: string;
  body: Localized<RichText | null>;
  cover: MediaRef | null;
  gallery: GalleryItem[];
  videoUrl: string;
  model: {
    file: MediaRef | null;
    poster: MediaRef | null;
    autoRotate: boolean;
    cameraOrbit: string;
    exposure: number;
    hotspots: Hotspot[];
  };
  seo: Seo;
};

export type ServiceDoc = BaseDoc & {
  title: Localized;
  slug: Localized;
  order: number;
  icon: string;
  summary: Localized;
  body: Localized<RichText | null>;
  deliverables: Localized<string[]>;
  phases: string[];
  standards: string[];
  software: string[];
  faq: { question: Localized; answer: Localized }[];
  seo: Seo;
};

export type PostDoc = BaseDoc & {
  title: Localized;
  slug: Localized;
  category: string;
  excerpt: Localized;
  body: Localized<RichText | null>;
  cover: MediaRef | null;
  author: string;
  date: string;
  related: string[];
  seo: Seo;
};

export type CategoryDoc = BaseDoc & {
  name: Localized;
  slug: Localized;
  kind: "project" | "post";
  order: number;
};

export type TimelineEntry = {
  start: string;
  end: string;
  organization: string;
  location: string;
  role: Localized;
  project: Localized;
};

export type AboutDoc = BaseDoc & {
  intro: Localized<RichText | null>;
  mission: Localized<RichText | null>;
  values: { title: Localized; text: Localized }[];
  valueEngineering: Localized<RichText | null>;
  standards: string[];
  software: string[];
  founder: {
    name: string;
    title: Localized;
    photo: MediaRef | null;
    bio: Localized<RichText | null>;
  };
  education: { title: Localized; school: string; year: string }[];
  memberships: { label: Localized; number: string; validated: boolean }[];
  languages: { language: Localized; level: Localized }[];
  qualities: Localized<string[]>;
  timeline: TimelineEntry[];
  seo: Seo;
};

export type MediaKind = "image" | "model" | "document";

export type MediaDoc = {
  id: string;
  key: string;
  url: string;
  kind: MediaKind;
  filename: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  hash: string;
  alt: Localized;
  caption: Localized;
  tags: string[];
  createdAt?: number;
  createdBy?: string;
};

export type UserDoc = { id: string; email: string; displayName: string; role: Role; createdAt?: number };
