import Link from "next/link";
import { notFound } from "next/navigation";
import { PostRow } from "@/components/ContentCards";
import {
  getListIds,
  getLists,
  getPostsByList,
  type ListId,
} from "@/lib/posts";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getListIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const meta = getLists()[id as ListId];
  if (!meta) return {};
  return { title: meta.title, description: meta.description };
}

export default async function ListPage({ params }: Props) {
  const { id } = await params;
  const listId = id as ListId;
  const meta = getLists()[listId];
  if (!meta) notFound();
  const posts = getPostsByList(listId);

  return (
    <div className="shell">
      <section className="page-hero">
        <Link href="/#lists" className="back">
          ← All lists
        </Link>
        <h1>{meta.title}</h1>
        <p className="lead">{meta.description}</p>
        <p className="meta-line">
          {posts.length} {posts.length === 1 ? "story" : "stories"}
        </p>
      </section>
      <section className="section">
        <div className="posts-stack">
          {posts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
