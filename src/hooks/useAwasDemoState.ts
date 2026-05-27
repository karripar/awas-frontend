import { useEffect, useMemo, useState, useCallback } from "react";

// Vite exposes environment variables via import.meta.env and requires the VITE_ prefix
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_SESSION_KEY?: string;
    readonly VITE_USER_ID_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
const SESSION_KEY = import.meta.env.VITE_SESSION_KEY ?? "awas.session";
const USER_ID_KEY = import.meta.env.VITE_USER_ID_KEY ?? "awas.user_id";

export type Role = "user" | "admin";

export type SessionUser = {
  id: string;
  username: string;
  role: Role;
};

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: Role;
};

export type PostRecord = {
  id: string;
  userId: string;
  authorName: string;
  title: string;
  text: string;
  private: boolean;
  createdAt: string;
};

export type SessionState = {
  user: SessionUser | null;
};

type AuthResult = {
  ok: boolean;
  message: string;
};

type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

type PostInput = {
  title: string;
  text: string;
  privatePost: boolean;
};

type ApiPostRecord = {
  post_id: string;
  user_id: string;
  username: string;
  title: string;
  text: string;
  private: number | boolean;
  created_at: string;
};

type ApiLoginResponse = {
  user_id: string;
  username: string;
  role: Role;
  session_token: string;
  message: string;
};

type ApiRegisterResponse = {
  user_id: string;
  username: string;
  message: string;
};

type ApiErrorResponse = {
  error: string;
};

type ApiPostsResponse = {
  posts: ApiPostRecord[];
};

type ApiMessageResponse = {
  message: string;
  post_id?: string;
};

const defaultSession: SessionState = {
  user: null,
};

function loadSession(): SessionState {
  if (typeof window === "undefined") {
    return defaultSession;
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return defaultSession;
    }

    const parsedSession = JSON.parse(rawSession) as SessionState;
    if (!parsedSession?.user) {
      return defaultSession;
    }

    return parsedSession;
  } catch {
    return defaultSession;
  }
}

function convertPostRecord(post: ApiPostRecord): PostRecord {
  return {
    id: post.post_id,
    userId: post.user_id,
    authorName: post.username,
    title: post.title,
    text: post.text,
    private: Boolean(post.private),
    createdAt:
      post.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  };
}

export function useAwasDemoState() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [session, setSession] = useState<SessionState>(loadSession);
  const [isLoading, setIsLoading] = useState(false);

  const sessionUser = useMemo(() => session.user, [session.user]);

  // Save session to localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  // Load initial posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`, {
          headers: {
            "X-User-ID": session.user?.id || "",
          },
        });
        if (response.ok) {
          const data = (await response.json()) as ApiPostsResponse;
          setPosts((data.posts || []).map(convertPostRecord));
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      }
    };
    fetchPosts();
  }, [session.user?.id]);

  // Load users for admin panel
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: { "X-User-ID": session.user?.id || "" },
        });
        if (response.ok) {
          const data = (await response.json()) as {
            users: Array<{
              user_id: string;
              username: string;
              email: string;
              role: Role;
              created_at?: string;
            }>;
          };
          setUsers(
            (data.users || []).map((u) => ({
              id: u.user_id,
              username: u.username,
              email: u.email,
              password: "", // password not returned
              role: u.role as Role,
            })),
          );
        }
      } catch {
        // ignore
      }
    };

    fetchUsers();
  }, [session.user?.id]);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data: ApiLoginResponse | ApiErrorResponse = await response.json();

        if (!response.ok) {
          const errorData = data as ApiErrorResponse;
          return { ok: false, message: errorData.error || "Login failed" };
        }

        const loginData = data as ApiLoginResponse;
        const newSession: SessionState = {
          user: {
            id: loginData.user_id,
            username: loginData.username,
            role: loginData.role,
          },
        };
        setSession(newSession);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(USER_ID_KEY, loginData.user_id);
        }

        return { ok: true, message: `Signed in as ${loginData.username}.` };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const register = useCallback(
    async ({
      username,
      email,
      password,
    }: RegisterInput): Promise<AuthResult> => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data: ApiRegisterResponse | ApiErrorResponse =
          await response.json();

        if (!response.ok) {
          const errorData = data as ApiErrorResponse;
          return {
            ok: false,
            message: errorData.error || "Registration failed",
          };
        }

        const registerData = data as ApiRegisterResponse;
        const newSession: SessionState = {
          user: {
            id: registerData.user_id,
            username: registerData.username,
            role: "user",
          },
        };
        setSession(newSession);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(USER_ID_KEY, registerData.user_id);
        }

        return { ok: true, message: "Account created and signed in." };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setSession(defaultSession);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_ID_KEY);
    }
  }, []);

  const createPost = useCallback(
    async ({ title, text, privatePost }: PostInput): Promise<AuthResult> => {
      if (!sessionUser) {
        return { ok: false, message: "Sign in before posting." };
      }

      if (!title.trim() || !text.trim()) {
        return { ok: false, message: "Title and message are required." };
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: sessionUser.id,
            title: title.trim(),
            text: text.trim(),
            private: privatePost,
          }),
        });

        const data: ApiMessageResponse | ApiErrorResponse =
          await response.json();

        if (!response.ok) {
          const errorData = data as ApiErrorResponse;
          return {
            ok: false,
            message: errorData.error || "Failed to create post",
          };
        }

        // Refresh posts
        const feedResponse = await fetch(`${API_BASE_URL}/feed`, {
          headers: { "X-User-ID": sessionUser.id },
        });
        if (feedResponse.ok) {
          const feedData = (await feedResponse.json()) as ApiPostsResponse;
          setPosts((feedData.posts || []).map(convertPostRecord));
        }

        return { ok: true, message: "Post published." };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionUser],
  );

  const deletePost = useCallback(
    async (postId: string) => {
      if (!sessionUser) return;

      try {
        await fetch(`${API_BASE_URL}/admin/feed/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: postId,
            user_id: sessionUser.id,
          }),
        });

        setPosts((currentPosts) =>
          currentPosts.filter((post) => post.id !== postId),
        );
      } catch {
        // Silently fail
      }
    },
    [sessionUser],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!sessionUser) return;

      try {
        await fetch(`${API_BASE_URL}/admin/user/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            current_user_id: sessionUser.id,
          }),
        });

        setPosts((currentPosts) =>
          currentPosts.filter((post) => post.userId !== userId),
        );

        if (sessionUser?.id === userId) {
          logout();
        }
      } catch {
        // Silently fail
      }
    },
    [sessionUser, logout],
  );

  const promoteUser = useCallback(
    async (userId: string) => {
      if (!sessionUser) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/user/promote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            current_user_id: sessionUser.id,
          }),
        });

        if (response.ok && sessionUser?.id === userId) {
          setSession({
            user: {
              ...sessionUser,
              role: "admin",
            },
          });
        }
      } catch {
        // Silently fail
      }
    },
    [sessionUser],
  );

  const demoteUser = useCallback(
    async (userId: string) => {
      if (!sessionUser) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/user/demote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            current_user_id: sessionUser.id,
          }),
        });

        if (response.ok && sessionUser?.id === userId) {
          setSession({
            user: {
              ...sessionUser,
              role: "user",
            },
          });
        }
      } catch {
        // Silently fail
      }
    },
    [sessionUser],
  );

  return {
    users,
    posts,
    session,
    login,
    register,
    logout,
    createPost,
    deletePost,
    deleteUser,
    promoteUser,
    demoteUser,
    isLoading,
  };
}
