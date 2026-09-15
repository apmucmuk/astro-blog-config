import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

const contributorSchema = z.object({
  person: z.string().min(1),
  role: z.enum(["editor", "reviewedBy", "factCheckedBy", "research"]),
});

const urlSchema = z.string().refine((value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}, "Expected an absolute http(s) URL.");

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    seoTitle: z.string().min(1).optional(),
    description: z.string().min(1),
    slug: z.string().min(1),
    locale: z.literal("pl"),
    translationKey: z.string().min(1),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    updateNote: z.string().max(180).optional(),
    authors: z.array(z.string().min(1)).min(1),
    contributors: z.array(contributorSchema).default([]),
    category: z.string().min(1),
    tags: z.array(z.string()).default([]),
    image: imageSchema,
    socialImage: imageSchema.optional(),
    draft: z.boolean().default(false),
    canonical: urlSchema.optional(),
    noindex: z.boolean().default(false),
    featured: z.boolean().default(false),
    related: z.array(z.string()).default([]),
    toc: z.boolean().default(true),
    redirectFrom: z.array(z.string()).default([]),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/people" }),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    locale: z.literal("pl"),
    role: z.enum(["editor_in_chief", "senior_editor", "editor", "author", "contributor"]),
    rank: z.number().int(),
    headline: z.string().min(1),
    bioShort: z.string().min(1),
    bio: z.string().min(1),
    expertise: z.array(z.string()).default([]),
    image: imageSchema.optional(),
    links: z.array(z.object({ label: z.string(), href: urlSchema })).default([]),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { blog, people };
