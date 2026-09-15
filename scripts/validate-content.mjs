import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.resolve(root, process.env.CONTENT_ROOT ?? "src/content");
const blogDir = path.join(contentRoot, "blog");
const peopleDir = path.join(contentRoot, "people");
const categoriesPath = path.join(contentRoot, "data", "categories.json");

const contributorRoles = new Set(["editor", "reviewedBy", "factCheckedBy", "research"]);

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function listFiles(directory, extension) {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listFiles(absolutePath, extension);
      }

      return entry.name.endsWith(extension) ? [absolutePath] : [];
    }),
  );

  return files.flat();
}

function requireString(value, field, file) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${file}: '${field}' must be a non-empty string.`);
  }
}

function validateRootRelativePath(value, field, file) {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("://")) {
    throw new Error(`${file}: '${field}' must be a root-relative path.`);
  }
}

function validateCanonical(value, file) {
  if (value === undefined) {
    return;
  }

  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error(`${file}: 'canonical' must be a valid absolute URL.`);
  }
}

function routeKey(article, categoriesById) {
  const category = categoriesById.get(article.category);
  if (!category) {
    return `${article.locale}:unknown-category:${article.slug}`;
  }

  return `${article.locale}:${category.slug}:${article.slug}`;
}

function assertUnique(items, getKey, label) {
  const seen = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: '${key}' in ${seen.get(key)} and ${item.__file}.`);
    }
    seen.set(key, item.__file);
  }
}

async function readPeople() {
  const personFiles = await listFiles(peopleDir, ".json");
  return Promise.all(
    personFiles.map(async (filePath) => {
      const person = await readJson(filePath);
      person.__file = path.relative(root, filePath);
      return person;
    }),
  );
}

async function readArticles() {
  const articleFiles = await listFiles(blogDir, ".mdx");
  return Promise.all(
    articleFiles.map(async (filePath) => {
      const parsed = matter(await readFile(filePath, "utf8"));
      return {
        ...parsed.data,
        __file: path.relative(root, filePath),
      };
    }),
  );
}

function validatePeople(people) {
  assertUnique(people, (person) => person.id, "person id");
  assertUnique(people, (person) => `${person.locale}:${person.slug}`, "person slug");

  for (const person of people) {
    requireString(person.id, "id", person.__file);
    requireString(person.name, "name", person.__file);
    requireString(person.slug, "slug", person.__file);
    requireString(person.locale, "locale", person.__file);
  }
}

function validateArticles(articles, categoriesById, peopleById) {
  assertUnique(articles, (article) => article.id, "article id");
  assertUnique(articles, (article) => routeKey(article, categoriesById), "article route");

  for (const article of articles) {
    requireString(article.id, "id", article.__file);
    requireString(article.slug, "slug", article.__file);
    requireString(article.locale, "locale", article.__file);
    requireString(article.translationKey, "translationKey", article.__file);
    requireString(article.category, "category", article.__file);

    if (!categoriesById.has(article.category)) {
      throw new Error(`${article.__file}: unknown category '${article.category}'.`);
    }

    if (!Array.isArray(article.authors) || article.authors.length === 0) {
      throw new Error(`${article.__file}: authors[] must contain at least one person id.`);
    }

    for (const author of article.authors) {
      if (!peopleById.has(author)) {
        throw new Error(`${article.__file}: unknown author '${author}'.`);
      }
    }

    for (const contributor of article.contributors ?? []) {
      if (!peopleById.has(contributor.person)) {
        throw new Error(`${article.__file}: unknown contributor '${contributor.person}'.`);
      }
      if (!contributorRoles.has(contributor.role)) {
        throw new Error(`${article.__file}: unsupported contributor role '${contributor.role}'.`);
      }
    }

    if (!article.image?.src || !article.image?.alt) {
      throw new Error(`${article.__file}: image.src and image.alt are required.`);
    }

    validateCanonical(article.canonical, article.__file);

    for (const redirect of article.redirectFrom ?? []) {
      validateRootRelativePath(redirect, "redirectFrom[]", article.__file);
    }
  }
}

async function main() {
  const categories = await readJson(categoriesPath);
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const people = await readPeople();
  const articles = await readArticles();
  const peopleById = new Map(people.map((person) => [person.id, person]));

  validatePeople(people);
  validateArticles(articles, categoriesById, peopleById);

  console.log(
    `Content validation passed: ${articles.length} article(s), ${people.length} person record(s), ${categories.length} categor(y/ies).`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
