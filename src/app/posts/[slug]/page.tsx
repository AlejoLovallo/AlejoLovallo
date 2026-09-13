import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  formatDate,
  getAllPosts,
  getLists,
  getPostBySlug,
} from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const list = getLists()[post.list];

  return (
    <div className="shell">
      <article>
        <header className="page-hero">
          <Link href={`/lists/${post.list}`} className="back">
            ← {list.title}
          </Link>
          <h1>{post.title}</h1>
          <div className="meta-line">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
            {post.mediumUrl ? (
              <>
                <span aria-hidden>·</span>
                <a
                  href={post.mediumUrl}
                  className="subtle-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Original on Medium
                </a>
              </>
            ) : null}
          </div>
        </header>
        <div className="prose-wrap">
          <div className="prose prose-invert prose-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  );
}
