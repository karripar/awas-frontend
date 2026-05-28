import { NavLink } from "react-router-dom";

type AppHeaderProps = {
  username: string;
  role: string;
  signedIn: boolean;
  onLogout: () => void;
  isAdmin: boolean;
};

export function AppHeader({
  username,
  role,
  signedIn,
  onLogout,
  isAdmin,
}: AppHeaderProps) {
  const navClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "swiss-focus border-b-2 border-[#E4002B] px-1 py-2 text-sm font-semibold text-[#111111]"
      : "swiss-focus border-b-2 border-transparent px-1 py-2 text-sm text-neutral-600 hover:border-[#111111] hover:text-[#111111]";

  const adminClassName = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "swiss-focus border-b-2 border-[#E4002B] px-1 py-2 text-sm font-semibold text-[#111111]"
      : "swiss-focus border-b-2 border-transparent px-1 py-2 text-sm text-neutral-600 hover:border-[#111111] hover:text-[#111111]";

  return (
    <header className="border-b border-neutral-300 bg-white">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 px-4 py-4 md:px-8 lg:grid-cols-[minmax(220px,1fr)_auto_minmax(260px,1fr)] lg:items-center">
        <div className="flex min-w-0 items-stretch gap-4">
          <div className="grid h-12 w-12 place-items-center bg-[#E4002B] text-base font-bold text-white">
            B
          </div>
          <div className="min-w-0 border-l border-neutral-300 pl-4">
            <h1 className="text-xl font-bold text-[#111111]">
              BlogSpot
            </h1>
            <p className="truncate text-sm text-neutral-500">
              Editorial workspace
            </p>
          </div>
        </div>

        {signedIn ? (
          <nav className="flex w-full flex-wrap items-center gap-5 border-y border-neutral-300 py-1 lg:w-auto lg:border-y-0">
            <NavLink to="/" end className={navClassName}>
              Home
            </NavLink>
            <NavLink to="/posts" className={navClassName}>
              Posts
            </NavLink>
            <NavLink to="/create" className={navClassName}>
              Create post
            </NavLink>
            {isAdmin ? (
              <NavLink to="/admin" className={adminClassName}>
                Admin
              </NavLink>
            ) : null}
          </nav>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 sm:justify-between lg:justify-end">
          <div className="flex min-w-0 items-center gap-4 border border-neutral-300 bg-white px-3 py-2">
            <div className="min-w-0 pr-1">
              <p className="truncate text-sm font-semibold text-[#111111]">
                {username}
              </p>
              <p className="text-xs capitalize text-neutral-500">{role}</p>
            </div>
            {signedIn ? (
              <button
                type="button"
                className="swiss-focus border-l border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:text-[#E4002B]"
                onClick={onLogout}
              >
                Log out
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
