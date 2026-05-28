import type { Dispatch, SetStateAction } from "react";

export type PostFormState = {
  title: string;
  text: string;
  privatePost: boolean;
};

type CreatePostFormProps = {
  signedIn: boolean;
  postForm: PostFormState;
  onPostFormChange: Dispatch<SetStateAction<PostFormState>>;
  onSubmit: (form: PostFormState) => void;
};

export function CreatePostForm({
  signedIn,
  postForm,
  onPostFormChange,
  onSubmit,
}: CreatePostFormProps) {
  return (
    <form
      className="border border-neutral-300 bg-white"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(postForm);
      }}
    >
      <div className="border-b border-neutral-300 px-5 py-4">
        <p className="text-sm font-bold text-[#111111]">New post</p>
      </div>

      <div className="space-y-5 p-5">
        <label className="block text-sm font-semibold text-[#111111]">
          Title
          <input
            className="swiss-focus mt-2 w-full border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111] disabled:bg-[#F7F7F8]"
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

        <label className="block text-sm font-semibold text-[#111111]">
          Message
          <textarea
            className="swiss-focus mt-2 w-full resize-y border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111] disabled:bg-[#F7F7F8]"
            value={postForm.text}
            onChange={(event) =>
              onPostFormChange((current) => ({
                ...current,
                text: event.target.value,
              }))
            }
            placeholder="Write the post body here"
            rows={8}
            disabled={!signedIn}
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-300 pt-5">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#E4002B]"
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
            className="swiss-focus border border-[#111111] bg-[#111111] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E4002B] disabled:border-neutral-300 disabled:bg-neutral-300"
            disabled={!signedIn}
          >
            Publish
          </button>
        </div>
      </div>
    </form>
  );
}
