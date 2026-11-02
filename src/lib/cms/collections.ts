/** Firestore collection names and the cache tags pages use to read them. */
export const COLLECTIONS = {
  projects: "projects",
  services: "services",
  posts: "posts",
  categories: "categories",
  media: "media",
  settings: "settings",
  users: "users",
  invitations: "invitations",
  auditLog: "auditLog",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Content collections whose documents can be revalidated from the back-office. */
export const REVALIDATABLE = ["projects", "services", "posts", "categories", "media", "settings"] as const;
export type RevalidatableCollection = (typeof REVALIDATABLE)[number];

export const cacheTag = {
  collection: (name: RevalidatableCollection) => `cms:${name}`,
  doc: (name: RevalidatableCollection, id: string) => `cms:${name}:${id}`,
};
