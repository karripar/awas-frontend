import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PostFormState } from "./CreatePostForm.tsx";
import type { PostRecord, SessionUser } from "../hooks/useBlogApi.ts";

type PostListProps = {
  title: string;
  posts: PostRecord[];
  currentUser: SessionUser | null;
  emptyMessage: string;
  onDeletePost: (postId: string) => void;
  onUpdatePost: (postId: string, form: PostFormState) => Promise<boolean>;
};

export function PostList({
  title,
  posts,
  currentUser,
  emptyMessage,
  onDeletePost,
  onUpdatePost,
}: PostListProps) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PostFormState>({
    title: "",
    text: "",
    privatePost: false,
  });

  const startEditing = (post: PostRecord) => {
    setEditingPostId(post.id);
    setEditForm({
      title: post.title,
      text: post.text,
      privatePost: post.private,
    });
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditForm({ title: "", text: "", privatePost: false });
  };

  const submitEdit = async (postId: string) => {
    const updated = await onUpdatePost(postId, editForm);
    if (updated) {
      cancelEditing();
    }
  };

  return (
    <section className="border border-neutral-300 bg-white">
      <div className="border-b border-neutral-300 px-5 py-4">
        <p className="text-sm font-bold text-[#111111]">{title}</p>
      </div>

      <div className="divide-y divide-neutral-300">
        {posts.map((post) => {
          const canDelete =
            currentUser?.role === "admin" || currentUser?.id === post.userId;
          const canEdit = currentUser?.id === post.userId;
          const isEditing = editingPostId === post.id;

          return (
            <article
              key={post.id}
              className="border-l-2 border-l-[#E4002B] px-5 py-5"
            >
              {isEditing ? (
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitEdit(post.id);
                  }}
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <label className="block text-sm font-semibold text-[#111111]">
                      Title
                      <input
                        className="swiss-focus mt-2 w-full border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111]"
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="flex items-center gap-2 self-end border border-neutral-300 bg-[#F7F7F8] px-3 py-3 text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#E4002B]"
                        checked={editForm.privatePost}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            privatePost: event.target.checked,
                          }))
                        }
                      />
                      Private post
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-[#111111]">
                    Message
                    <textarea
                      className="swiss-focus mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111]"
                      value={editForm.text}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          text: event.target.value,
                        }))
                      }
                      rows={5}
                    />
                  </label>

                  <div className="flex flex-wrap gap-2 border-t border-neutral-300 pt-5">
                    <button
                      type="submit"
                      className="swiss-focus border border-[#111111] bg-[#111111] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E4002B]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="swiss-focus border border-neutral-300 bg-white px-5 py-3 text-sm text-neutral-700 hover:border-[#111111] hover:text-[#111111]"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <span className="block text-sm text-neutral-500">
                      Posts / {post.private ? "Private" : "Public"}
                    </span>
                    <strong className="block text-xl font-bold leading-tight text-[#111111]">
                      {post.title}
                    </strong>
                    <span className="block text-sm text-neutral-500">
                      {post.authorName} / {post.createdAt}
                    </span>
                    <p className="max-w-3xl text-sm leading-6 text-neutral-700">
                      {post.text}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span
                      className={
                        post.private
                          ? "border border-[#E4002B] bg-white px-2 py-1 text-xs font-semibold text-[#E4002B]"
                          : "border border-neutral-300 bg-[#F7F7F8] px-2 py-1 text-xs font-semibold text-neutral-700"
                      }
                    >
                      {post.private ? "Private" : "Public"}
                    </span>
                    {canEdit ? (
                      <button
                        type="button"
                        className="swiss-focus grid h-9 w-9 place-items-center border border-neutral-300 text-neutral-700 hover:border-[#111111] hover:text-[#111111]"
                        aria-label={`Edit ${post.title}`}
                        title="Edit"
                        onClick={() => startEditing(post)}
                      >
                        <Pencil aria-hidden="true" size={16} strokeWidth={2} />
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className="swiss-focus grid h-9 w-9 place-items-center border border-[#E4002B] text-[#E4002B] hover:bg-[#E4002B] hover:text-white"
                        aria-label={`Delete ${post.title}`}
                        title="Delete"
                        onClick={() => onDeletePost(post.id)}
                      >
                        <Trash2 aria-hidden="true" size={16} strokeWidth={2} />
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {posts.length === 0 ? (
          <div className="px-5 py-12 text-sm text-neutral-500">
            {emptyMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}
