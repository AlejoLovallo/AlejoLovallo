import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type ListId = "fonder-ai-treasury" | "blockchain-crypto" | "reflections";

export type ListMeta = {
  title: string;
  description: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  list: ListId;
  excerpt: string;
  mediumUrl?: string;
  cover?: string;
  readingMinutes: number;
};

export type Post = PostMeta & {
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const LISTS_PATH = path.join(process.cwd(), "content/lists.json");

function toDateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return value.slice(0, 10);
  }
  return "1970-01-01";
}

export function getLists(): Record<ListId, ListMeta> {
  return JSON.parse(fs.readFileSync(LISTS_PATH, "utf8")) as Record<
    ListId,
    ListMeta
  >;
}

export function getListIds(): ListId[] {
  return Object.keys(getLists()) as ListId[];
}

function findCover(data: matter.GrayMatterFile<string>["data"], content: string) {
  if (data.cover) return String(data.cover);
  const match = content.match(/!\[[^\]]*\]\((\/[^)\s]+)/);
  return match?.[1];
}

function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  const mediumUrl = data.mediumUrl ?? data.medium_url;
  return {
    slug,
    title: String(data.title ?? slug),
    date: toDateString(data.date),
    list: data.list as ListId,
    excerpt: String(data.excerpt ?? ""),
    mediumUrl: mediumUrl ? String(mediumUrl) : undefined,
    cover: findCover(data, content),
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
    content,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      return parsePost(
        slug,
        fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
      );
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  for (const ext of [".mdx", ".md"] as const) {
    const filePath = path.join(POSTS_DIR, `${slug}${ext}`);
    if (fs.existsSync(filePath)) {
      return parsePost(slug, fs.readFileSync(filePath, "utf8"));
    }
  }
  return null;
}

export function getPostsByList(listId: ListId): Post[] {
  return getAllPosts().filter((post) => post.list === listId);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
