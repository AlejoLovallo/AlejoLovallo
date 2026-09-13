import { ListCard, PostRow } from "@/components/ContentCards";
import { getAllPosts, getListIds, getLists, getPostsByList } from "@/lib/posts";

export default function HomePage() {
  const lists = getLists();
  const listIds = getListIds();
  const posts = getAllPosts();

  return (
    <div className="shell">
      <section className="hero">
        <p className="kicker">Writing</p>
        <h1>Alejo Lovallo</h1>
        <p className="lead">
          Notes on AI treasury, fintech systems, and blockchain — moved from
          Medium into clean lists you can actually browse.
        </p>
      </section>

      <section id="lists" className="section">
        <div className="section-head">
          <h2>Lists</h2>
        </div>
        <div className="lists-grid">
          {listIds.map((id) => (
            <ListCard
              key={id}
              id={id}
              meta={lists[id]}
              count={getPostsByList(id).length}
            />
          ))}
        </div>
      </section>

      <section id="writing" className="section">
        <div className="section-head">
          <h2>Latest</h2>
        </div>
        <div className="posts-stack">
          {posts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
