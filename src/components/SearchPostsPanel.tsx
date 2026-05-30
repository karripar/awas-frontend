type SearchPostsPanelProps = {
  search: string;
  showMineOnly: boolean;
  onSearchChange: (search: string) => void;
  onShowMineOnlyChange: (showMineOnly: boolean) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function SearchPostsPanel({
  search,
  showMineOnly,
  onSearchChange,
  onShowMineOnlyChange,
  onSubmit,
  onClear,
}: SearchPostsPanelProps) {
  return (
    <form
      className="border border-neutral-300 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block text-sm font-semibold text-[#111111]">
          Search posts
          <input
            className="swiss-focus mt-2 w-full border border-neutral-300 bg-white px-3 py-3 text-[#111111] transition focus:border-[#111111]"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search titles, text, or authors"
          />
        </label>

        <label className="flex min-h-12 items-center gap-2 border border-neutral-300 bg-[#F7F7F8] px-3 py-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#E4002B]"
            checked={showMineOnly}
            onChange={(event) => onShowMineOnlyChange(event.target.checked)}
          />
          My posts only
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-300 pt-5">
        <button
          type="submit"
          className="swiss-focus border border-[#111111] bg-[#111111] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E4002B]"
        >
          Search
        </button>
        <button
          type="button"
          className="swiss-focus border border-neutral-300 bg-white px-5 py-3 text-sm text-neutral-700 hover:border-[#111111] hover:text-[#111111]"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
