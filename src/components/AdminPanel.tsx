import type { PostRecord, UserRecord } from "../hooks/useBlogApi.ts";

type AdminPanelProps = {
  users: UserRecord[];
  posts: PostRecord[];
  onDeletePost: (postId: string) => Promise<boolean>;
  onDeleteUser: (userId: string) => void;
  onPromoteUser: (userId: string) => void;
  onDemoteUser: (userId: string) => void;
};

export function AdminPanel({
  users,
  posts,
  onDeletePost,
  onDeleteUser,
  onPromoteUser,
  onDemoteUser,
}: AdminPanelProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        These controls are local demo actions for the project review.
      </p>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Users</h3>
          <div className="space-y-3">
            {users.map((user) => (
              <article
                key={user.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold text-slate-900">
                    {user.username}
                  </strong>
                  <span className="block text-sm text-slate-500">
                    {user.email}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                    {user.role}
                  </span>
                  {user.role !== "admin" && (
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => {
                        if (confirm(`Promote ${user.username} to admin?`)) {
                          onPromoteUser(user.id);
                        }
                      }}
                    >
                      Promote
                    </button>
                  )}
                  {user.role === "admin" && (
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => {
                        if (confirm(`Demote ${user.username} from admin?`)) {
                          onDemoteUser(user.id);
                        }
                      }}
                    >
                      Demote
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete user ${user.username}? This action cannot be undone.`,
                        )
                      ) {
                        onDeleteUser(user.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Posts</h3>
          <div className="space-y-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold text-slate-900">
                    {post.title}
                  </strong>
                  <span className="block text-sm text-slate-500">
                    {post.authorName}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                    {post.private ? "Private" : "Public"}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (
                        confirm(
                          `Delete post "${post.title}"? This action cannot be undone.`,
                        )
                      ) {
                        onDeletePost(post.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
