import { useState, useEffect } from "react";
import { useBlogApi } from "./hooks/useBlogApi.ts";
import { AppHeader } from "./components/AppHeader.tsx";
import { AuthPanel } from "./components/AuthPanel.tsx";
import { FeedPanel } from "./components/FeedPanel.tsx";
import { AdminPanel } from "./components/AdminPanel.tsx";

type AuthMode = "login" | "register";
type PanelView = "feed" | "admin";

function App() {
  const {
    posts,
    session,
    users,
    login,
    logout,
    register,
    loadPosts,
    createPost,
    deletePost,
    deleteUser,
    promoteUser,
    demoteUser,
  } = useBlogApi();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activeView, setActiveView] = useState<PanelView>("feed");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [postForm, setPostForm] = useState({
    title: "",
    text: "",
    privatePost: false,
  });

  const signedIn = Boolean(session.user);
  const isAdmin = session.user?.role === "admin";

  useEffect(() => {
    // If user loses admin privileges while admin view is active, reset to feed.

    // cascading renders (React warning). setTimeout defers to next tick.
    if (!isAdmin && activeView === "admin") {
      const t = setTimeout(() => setActiveView("feed"), 0);
      return () => clearTimeout(t);
    }
  }, [isAdmin, activeView]);

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6">
          {notice ? (
            <p className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              {notice}
            </p>
          ) : null}

          <AuthPanel
            mode={authMode}
            form={authForm}
            onModeChange={setAuthMode}
            onFormChange={setAuthForm}
            onSubmit={async (submittedForm) => {
              const result =
                authMode === "login"
                  ? await login(
                      submittedForm.username.trim(),
                      submittedForm.password,
                    )
                  : await register({
                      username: submittedForm.username.trim(),
                      email: submittedForm.email.trim(),
                      password: submittedForm.password,
                    });

              setNotice(result.message);

              if (result.ok) {
                setAuthMode("login");
                setActiveView("feed");
              }
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-200 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        <AppHeader
          username={session.user?.username ?? "Guest"}
          role={session.user?.role ?? "Not signed in"}
          signedIn={signedIn}
          onLogout={() => {
            logout();
            setNotice("");
          }}
        />

        {notice ? (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {notice}
          </p>
        ) : null}

        {activeView === "feed" ? (
          <form
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void loadPosts(search);
            }}
          >
            <label className="block text-sm font-medium text-slate-700">
              Search posts
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-slate-300"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search titles, text, or authors"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Search
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  setSearch("");
                  void loadPosts();
                }}
              >
                Clear
              </button>
            </div>
          </form>
        ) : null}

        <section className="grid gap-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Workspace
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  {activeView === "feed" ? "Feed" : "Admin"}
                </h2>
              </div>

              <div className="inline-flex rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  className={
                    activeView === "feed"
                      ? "rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm"
                      : "rounded-full px-4 py-2 text-sm text-slate-600"
                  }
                  onClick={() => setActiveView("feed")}
                >
                  Feed
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    className={
                      activeView === "admin"
                        ? "rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm"
                        : "rounded-full px-4 py-2 text-sm text-slate-600"
                    }
                    onClick={() => setActiveView("admin")}
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>

            {activeView === "feed" ? (
              <FeedPanel
                signedIn={signedIn}
                postForm={postForm}
                onPostFormChange={setPostForm}
                onSubmit={async (submittedForm) => {
                  const result = await createPost(submittedForm);
                  setNotice(result.message);

                  if (result.ok) {
                    setPostForm({ title: "", text: "", privatePost: false });
                  }
                }}
                posts={posts}
                onDeletePost={deletePost}
              />
            ) : activeView === "admin" ? (
              isAdmin ? (
                <AdminPanel
                  users={users}
                  posts={posts}
                  onDeletePost={deletePost}
                  onDeleteUser={deleteUser}
                  onPromoteUser={promoteUser}
                  onDemoteUser={demoteUser}
                />
              ) : (
                <p className="text-sm text-slate-600">
                  You are not authorized to view this panel.
                </p>
              )
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
