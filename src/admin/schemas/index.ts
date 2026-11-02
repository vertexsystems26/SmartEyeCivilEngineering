import type { CollectionSchema } from "../schema/types";
import { aboutSchema } from "./about";
import { categoriesSchema } from "./categories";
import { postsSchema } from "./posts";
import { projectsSchema } from "./projects";
import { servicesSchema } from "./services";

/** Collections reachable at /admin/<slug>. */
export const collectionSchemas = [projectsSchema, servicesSchema, postsSchema, categoriesSchema];

export const schemaBySlug = (slug: string): CollectionSchema | undefined =>
  collectionSchemas.find((s) => s.slug === slug);

export const schemaByCollection = (collection: string): CollectionSchema | undefined =>
  [...collectionSchemas, aboutSchema].find((s) => s.collection === collection);

export { aboutSchema, categoriesSchema, postsSchema, projectsSchema, servicesSchema };
