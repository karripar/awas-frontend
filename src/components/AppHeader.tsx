type AppHeaderProps = {
  username: string;
  role: string;
  signedIn: boolean;
  onLogout: () => void;
};

export function AppHeader({
  username,
  role,
  signedIn,
  onLogout,
}: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-start md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          AWAS Project
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          BlogSpot
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
          Share your thoughts and ideas with the world. This is a demo app for the AWAS project review, showcasing a simple blogging platform with user roles and permissions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:min-w-56">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Session
        </p>
        <strong className="mt-1 block text-sm font-semibold text-slate-900">
          {username}
        </strong>
        <span className="block text-sm text-slate-600">{role}</span>
        {signedIn ? (
          <button
            type="button"
            className="mt-3 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            onClick={onLogout}
          >
            Log out
          </button>
        ) : null}
      </div>
    </header>
  );
}
