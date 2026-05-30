import { useState, type Dispatch, type SetStateAction } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  useBlogApi,
  type PostRecord,
  type SessionUser,
} from "./hooks/useBlogApi.ts";
import { AppHeader } from "./components/AppHeader.tsx";
import { AuthPanel } from "./components/AuthPanel.tsx";
import { AdminPanel } from "./components/AdminPanel.tsx";
import {
  CreatePostForm,
  type PostFormState,
} from "./components/CreatePostForm.tsx";
import { PostList } from "./components/PostList.tsx";
import { SearchPostsPanel } from "./components/SearchPostsPanel.tsx";

type AuthMode = "login" | "register";

function App() {
  const {
    feedPosts,
    searchResults,
    session,
    users,
    login,
    logout,
    register,
    searchPosts,
    clearSearchResults,
    createPost,
    updatePost,
    deletePost,
    deleteUser,
    promoteUser,
    demoteUser,
  } = useBlogApi();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchHasRun, setSearchHasRun] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [postForm, setPostForm] = useState<PostFormState>({
    title: "",
    text: "",
    privatePost: false,
  });

  const signedIn = Boolean(session.user);
  const isAdmin = session.user?.role === "admin";
  const resetPostForm = () => {
    setPostForm({ title: "", text: "", privatePost: false });
  };
  const handleLogout = () => {
    logout();
    setNotice("");
    setSearch("");
    setSearchHasRun(false);
    setShowMineOnly(false);
    resetPostForm();
    clearSearchResults();
    navigate("/login", { replace: true });
  };

  const handleAuthSubmit = async (
    mode: AuthMode,
    submittedForm: typeof authForm,
  ) => {
    const result =
      mode === "login"
        ? await login(submittedForm.username.trim(), submittedForm.password)
        : await register({
            username: submittedForm.username.trim(),
            email: submittedForm.email.trim(),
            password: submittedForm.password,
          });

    setNotice(result.message);

    if (result.ok) {
      navigate("/", { replace: true });
    }
  };

  const handleCreatePost = async (submittedForm: PostFormState) => {
    const result = await createPost(submittedForm);
    setNotice(result.message);

    if (result.ok) {
      resetPostForm();
      navigate("/posts");
    }
  };

  const handleSearch = async () => {
    const query = search.trim();
    const result = await searchPosts(search);
    setSearchHasRun(Boolean(query));
    setNotice(result.message);
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchHasRun(false);
    setNotice("");
    clearSearchResults();
  };

  const handleUpdatePost = async (
    postId: string,
    submittedForm: PostFormState,
  ) => {
    const result = await updatePost(postId, submittedForm);
    setNotice(result.message);
    return result.ok;
  };

  if (!signedIn) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <AuthPage
              mode="login"
              notice={notice}
              form={authForm}
              onModeChange={(mode) => navigate(`/${mode}`)}
              onFormChange={setAuthForm}
              onSubmit={(form) => void handleAuthSubmit("login", form)}
            />
          }
        />
        <Route
          path="/register"
          element={
            <AuthPage
              mode="register"
              notice={notice}
              form={authForm}
              onModeChange={(mode) => navigate(`/${mode}`)}
              onFormChange={setAuthForm}
              onSubmit={(form) => void handleAuthSubmit("register", form)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <main className="swiss-grid min-h-screen text-[#111111]">
      <AppHeader
        username={session.user?.username ?? "Guest"}
        role={session.user?.role ?? "Not signed in"}
        signedIn={signedIn}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-10">
        {notice ? (
          <p className="mb-6 border border-l-2 border-neutral-300 border-l-[#E4002B] bg-white px-5 py-4 text-sm text-neutral-700">
            {notice}
          </p>
        ) : null}

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                username={session.user?.username ?? "Guest"}
                isAdmin={isAdmin}
              />
            }
          />
          <Route
            path="/posts"
            element={
              <PostsPage
                posts={searchHasRun ? searchResults : feedPosts}
                search={search}
                searchHasRun={searchHasRun}
                showMineOnly={showMineOnly}
                currentUser={session.user}
                onSearchChange={setSearch}
                onShowMineOnlyChange={setShowMineOnly}
                onSearch={() => void handleSearch()}
                onClear={handleClearSearch}
                onDeletePost={deletePost}
                onUpdatePost={handleUpdatePost}
              />
            }
          />
          <Route
            path="/create"
            element={
              <CreatePage
                signedIn={signedIn}
                postForm={postForm}
                onPostFormChange={setPostForm}
                onSubmit={(form) => void handleCreatePost(form)}
              />
            }
          />
          <Route path="/search" element={<Navigate to="/posts" replace />} />
          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminPanel
                  users={users}
                  posts={feedPosts}
                  onDeletePost={deletePost}
                  onDeleteUser={deleteUser}
                  onPromoteUser={promoteUser}
                  onDemoteUser={demoteUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </main>
  );
}

type AuthPageProps = {
  mode: AuthMode;
  notice: string;
  form: {
    username: string;
    email: string;
    password: string;
  };
  onModeChange: (mode: AuthMode) => void;
  onFormChange: Dispatch<
    SetStateAction<{
      username: string;
      email: string;
      password: string;
    }>
  >;
  onSubmit: (form: {
    username: string;
    email: string;
    password: string;
  }) => void;
};

function AuthPage({
  mode,
  notice,
  form,
  onModeChange,
  onFormChange,
  onSubmit,
}: AuthPageProps) {
  return (
    <main className="swiss-grid min-h-screen text-[#111111]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 content-center px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:gap-12">
        <section className="hidden border-r border-neutral-300 pr-12 lg:block">
          <div className="mb-12 flex items-stretch gap-4">
            <div className="grid h-12 w-12 place-items-center bg-[#E4002B] text-lg font-bold text-white">
              B
            </div>
            <div className="border-l border-neutral-300 pl-4">
              <p className="text-2xl font-bold">BlogSpot</p>
              <p className="text-sm text-neutral-500">Editorial workspace</p>
            </div>
          </div>
          <p className="mb-6 border-l-2 border-[#E4002B] pl-4 text-sm text-neutral-500">
            BlogSpot / Login
          </p>
          <h1 className="max-w-2xl text-5xl font-bold leading-[0.98] text-[#111111]">
            Publish ideas
          </h1>
          <p className="mt-6 max-w-xl border-t border-neutral-300 pt-5 text-base leading-7 text-neutral-600">
            A focused writing space.
          </p>
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col justify-center lg:mx-0">
          <div className="mb-6 flex items-stretch gap-4 lg:hidden">
            <div className="grid h-11 w-11 place-items-center bg-[#E4002B] text-base font-bold text-white">
              B
            </div>
            <div className="border-l border-neutral-300 pl-4">
              <p className="text-xl font-bold">BlogSpot</p>
              <p className="text-sm text-neutral-500">Editorial workspace</p>
            </div>
          </div>

          {notice ? (
            <p className="mb-4 border border-neutral-300 border-l-[#E4002B] bg-white px-4 py-3 text-sm text-neutral-700">
              {notice}
            </p>
          ) : null}

          <AuthPanel
            mode={mode}
            form={form}
            onModeChange={onModeChange}
            onFormChange={onFormChange}
            onSubmit={onSubmit}
          />
        </section>
      </div>
    </main>
  );
}

function PageHeader({
  eyebrow,
  breadcrumb,
  title,
  description,
}: {
  eyebrow: string;
  breadcrumb: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 border border-l-2 border-neutral-300 border-l-[#E4002B] bg-white">
      <div className="border-b border-neutral-300 px-5 py-4">
        <p className="text-sm text-neutral-500">{breadcrumb}</p>
      </div>
      <div className="px-5 py-6 md:px-6 md:py-8">
        <p className="text-sm text-neutral-500">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-[#111111] md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function HomePage({
  username,
  isAdmin,
}: {
  username: string;
  isAdmin: boolean;
}) {
  const links = [
    {
      to: "/posts",
      breadcrumb: "Workspace / Posts",
      title: "Posts",
      description: "Read the current workspace feed.",
    },
    {
      to: "/create",
      breadcrumb: "Workspace / Create",
      title: "Create post",
      description: "Write a new public or private post.",
    },
    ...(isAdmin
      ? [
          {
            to: "/admin",
            breadcrumb: "Workspace / Admin",
            title: "Admin",
            description: "Manage users and posts.",
          },
        ]
      : []),
  ];

  return (
    <section>
      <PageHeader
        breadcrumb="Workspace / Home"
        eyebrow={`Signed in as ${username}`}
        title="Workspace home"
        description="Choose the task you want to work on. The main feed and post creation."
      />

      <div className="grid border-l border-t border-neutral-300 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="swiss-focus group min-h-48 border-b border-l-2 border-r border-l-[#E4002B] border-b-neutral-300 border-r-neutral-300 bg-white p-5 transition hover:bg-[#111111] hover:text-white"
          >
            <span className="mb-10 block text-sm text-neutral-500 group-hover:text-neutral-200">
              {link.breadcrumb}
            </span>
            <strong className="block text-xl font-bold text-[#111111] group-hover:text-white">
              {link.title}
            </strong>
            <span className="mt-3 block text-sm leading-6 text-neutral-600 group-hover:text-neutral-200">
              {link.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PostsPage({
  posts,
  search,
  searchHasRun,
  showMineOnly,
  currentUser,
  onSearchChange,
  onShowMineOnlyChange,
  onSearch,
  onClear,
  onDeletePost,
  onUpdatePost,
}: {
  posts: PostRecord[];
  search: string;
  searchHasRun: boolean;
  showMineOnly: boolean;
  currentUser: SessionUser | null;
  onSearchChange: (search: string) => void;
  onShowMineOnlyChange: (showMineOnly: boolean) => void;
  onSearch: () => void;
  onClear: () => void;
  onDeletePost: (postId: string) => void;
  onUpdatePost: (postId: string, form: PostFormState) => Promise<boolean>;
}) {
  const visiblePosts = showMineOnly
    ? posts.filter((post) => post.userId === currentUser?.id)
    : posts;
  const listTitle = searchHasRun ? "Search results" : "Posts";
  const emptyMessage = searchHasRun
    ? "No posts matched this search."
    : "No posts to display.";

  return (
    <section className="space-y-6">
      <PageHeader
        breadcrumb="Workspace / Posts"
        eyebrow="Feed"
        title="Posts"
        description="Browse posts, search the feed, or filter the list to your own posts."
      />
      <SearchPostsPanel
        search={search}
        showMineOnly={showMineOnly}
        onSearchChange={onSearchChange}
        onShowMineOnlyChange={onShowMineOnlyChange}
        onSubmit={onSearch}
        onClear={onClear}
      />
      <PostList
        title={listTitle}
        posts={visiblePosts}
        currentUser={currentUser}
        emptyMessage={emptyMessage}
        onDeletePost={onDeletePost}
        onUpdatePost={onUpdatePost}
      />
    </section>
  );
}

function CreatePage({
  signedIn,
  postForm,
  onPostFormChange,
  onSubmit,
}: {
  signedIn: boolean;
  postForm: PostFormState;
  onPostFormChange: Dispatch<SetStateAction<PostFormState>>;
  onSubmit: (form: PostFormState) => void;
}) {
  return (
    <section className="max-w-3xl">
      <PageHeader
        breadcrumb="Workspace / Create"
        eyebrow="Compose"
        title="Create post"
        description="Write a post for the workspace feed."
      />
      <CreatePostForm
        signedIn={signedIn}
        postForm={postForm}
        onPostFormChange={onPostFormChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}

export default App;
