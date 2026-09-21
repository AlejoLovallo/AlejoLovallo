import Image from "next/image";
import Link from "next/link";
import { formatDate, type ListMeta, type PostMeta } from "@/lib/posts";

export function ListCard({
  id,
  meta,
  count,
}: {
  id: string;
  meta: ListMeta;
  count: number;
}) {
  return (
    <Link href={`/lists/${id}`} className="list-card reveal">
      <div className="list-card-top">
        <h2>{meta.title}</h2>
        <span className="count-pill">
          {count} {count === 1 ? "story" : "stories"}
        </span>
      </div>
      <p>{meta.description}</p>
    </Link>
  );
}

export function PostRow({ post }: { post: PostMeta }) {
  return (
    <article className="post-row reveal">
      <Link href={`/posts/${post.slug}`} className="post-row-link">
        <div className="post-row-body">
          <div className="post-row-text">
            <div className="post-row-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.readingMinutes} min</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </div>
          {post.cover && (
            <div className="post-row-cover">
              <Image
                src={post.cover}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 220px"
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
