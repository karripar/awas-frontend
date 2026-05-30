import { Trash2 } from "lucide-react";
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
    <div className="space-y-6">
      <div className="border border-l-2 border-neutral-300 border-l-[#E4002B] bg-white">
        <div className="border-b border-neutral-300 px-5 py-4">
          <p className="text-sm text-neutral-500">Workspace / Admin</p>
        </div>
        <div className="px-5 py-6 md:px-6 md:py-8">
          <p className="text-sm text-neutral-500">Admin</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight text-[#111111] md:text-5xl">
            Workspace controls
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Manage users and posts in this workspace.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="border border-neutral-300 bg-white">
          <div className="border-b border-neutral-300 px-5 py-4">
            <h3 className="text-sm font-bold text-[#111111]">Users</h3>
          </div>

          <div className="divide-y divide-neutral-300">
            {users.map((user) => (
              <article
                key={user.id}
                className="grid gap-3 border-l-2 border-l-[#E4002B] px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <span className="block text-sm text-neutral-500">
                    Users / {user.role}
                  </span>
                  <strong className="block truncate text-sm font-bold text-[#111111]">
                    {user.username}
                  </strong>
                  <span className="block truncate text-sm text-neutral-500">
                    {user.email}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-neutral-300 bg-[#F7F7F8] px-2 py-1 text-xs font-semibold capitalize text-neutral-700">
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
                    <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
                  </button>
                </div>
              </article>
            ))}

            {users.length === 0 ? (
              <div className="px-5 py-12 text-sm text-neutral-500">
                No users to display.
              </div>
            ) : null}
          </div>
        </section>

        <section className="border border-neutral-300 bg-white">
          <div className="border-b border-neutral-300 px-5 py-4">
            <h3 className="text-sm font-bold text-[#111111]">Posts</h3>
          </div>

          <div className="divide-y divide-neutral-300">
            {posts.map((post) => (
              <article
                key={post.id}
                className="grid gap-3 border-l-2 border-l-[#E4002B] px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <span className="block text-sm text-neutral-500">
                    Posts / {post.private ? "Private" : "Public"}
                  </span>
                  <strong className="block truncate text-sm font-bold text-[#111111]">
                    {post.title}
                  </strong>
                  <span className="block truncate text-sm text-neutral-500">
                    {post.authorName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={
                      post.private
                        ? "border border-[#E4002B] bg-white px-2 py-1 text-xs font-semibold text-[#E4002B]"
                        : "border border-neutral-300 bg-[#F7F7F8] px-2 py-1 text-xs font-semibold text-neutral-700"
                    }
                  >
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
                    <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
                  </button>
                </div>
              </article>
            ))}

            {posts.length === 0 ? (
              <div className="px-5 py-12 text-sm text-neutral-500">
                No posts to display.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
