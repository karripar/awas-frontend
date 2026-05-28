import type { Dispatch, SetStateAction } from "react";
import type { PostRecord } from "../hooks/useBlogApi.ts";

type PostFormState = {
  title: string;
  text: string;
  privatePost: boolean;
};

type FeedPanelProps = {
  signedIn: boolean;
  postForm: PostFormState;
  onPostFormChange: Dispatch<SetStateAction<PostFormState>>;
  onSubmit: (form: PostFormState) => void;
  posts: PostRecord[];
  onDeletePost: (postId: string) => void;
};

export function FeedPanel({
  signedIn,
  postForm,
  onPostFormChange,
  onSubmit,
  posts,
  onDeletePost,
}: FeedPanelProps) {
  return (
    <div className="space-y-4">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(postForm);
        }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          New post
        </p>

        <label className="block text-sm font-medium text-slate-700">
          Title
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-300 disabled:bg-slate-50"
            value={postForm.title}
            onChange={(event) =>
              onPostFormChange((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Short post title"
            disabled={!signedIn}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Message
          <textarea
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-300 disabled:bg-slate-50"
            value={postForm.text}
            onChange={(event) =>
              onPostFormChange((current) => ({
                ...current,
                text: event.target.value,
              }))
            }
            placeholder="Write the post body here"
            rows={4}
            disabled={!signedIn}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={postForm.privatePost}
            onChange={(event) =>
              onPostFormChange((current) => ({
                ...current,
                privatePost: event.target.checked,
              }))
            }
            disabled={!signedIn}
          />
          Private post
        </label>

        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!signedIn}
        >
          Publish
        </button>
      </form>

      <div className="pt-2">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Posts
        </p>
        <div className="divide-y divide-slate-200">
          {posts.map((post) => (
            <article key={post.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold text-slate-900">
                    {post.title}
                  </strong>
                  <span className="block text-sm text-slate-500">
                    {post.authorName} · {post.createdAt}
                  </span>
                  <p className="max-w-3xl text-sm leading-6 text-slate-700">
                    {post.text}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                    {post.private ? "Private" : "Public"}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => onDeletePost(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {posts.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              No posts match the current search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
