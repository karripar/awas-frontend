import { useEffect, useMemo, useState, useCallback } from "react";

// Vite exposes environment variables via import.meta.env and requires the VITE_ prefix
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
import {
  clearSessionState,
  readSessionState,
  setSessionState,
} from "../lib/session.ts";

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
  message: string;
};

type ApiRegisterResponse = {
  user_id: string;
  username: string;
  role: Role;
  message: string;
};

type ApiSessionResponse =
  | {
      user_id: string;
      username: string;
      role: Role;
      email: string;
    }
  | {
      user: null;
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
  const parsedSession = readSessionState() as SessionState;
  return parsedSession?.user ? parsedSession : defaultSession;
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

export function useBlogApi() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [session, setSession] = useState<SessionState>(loadSession);
  const [isLoading, setIsLoading] = useState(false);

  const sessionUser = useMemo(() => session.user, [session.user]);
  const sessionUserId = session.user?.id || "";
  const sessionRole = session.user?.role;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/session`, {
          credentials: "include",
        });

        if (!response.ok) {
          setSession(defaultSession);
          return;
        }

        const data = (await response.json()) as ApiSessionResponse;
        if (!data || !("user_id" in data)) {
          setSession(defaultSession);
          return;
        }

        setSession({
          user: {
            id: data.user_id,
            username: data.username,
            role: data.role,
          },
        });
      } catch {
        setSession(defaultSession);
      }
    };

    void fetchSession();
  }, []);

  const loadPosts = useCallback(async (search = "") => {
    const query = search.trim();
    const searchParam = query ? `?search=${encodeURIComponent(query)}` : "";

    try {
      const response = await fetch(`${API_BASE_URL}/feed${searchParam}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = (await response.json()) as ApiPostsResponse;
        setPosts((data.posts || []).map(convertPostRecord));
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  }, []);

  useEffect(() => {
    setSessionState(session);
  }, [session]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`, {
          credentials: "include",
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
  }, [sessionUserId]);

  // Load users for admin panel
  useEffect(() => {
    if (sessionRole !== "admin") {
      const timer = window.setTimeout(() => setUsers([]), 0);
      return () => window.clearTimeout(timer);
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          credentials: "include",
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
  }, [sessionRole, sessionUserId]);

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          credentials: "include",
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
          credentials: "include",
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
            role: registerData.role,
          },
        };
        setSession(newSession);

        return { ok: true, message: "Account created and signed in." };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network failures on logout
    }

    setSession(defaultSession);
    clearSessionState();
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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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

        await loadPosts();

        return { ok: true, message: "Post published." };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [loadPosts, sessionUser],
  );

  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!sessionUser) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/feed/delete`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: postId,
          }),
        });

        if (response.status === 403) {
          return false;
        }

        if (!response.ok) {
          return false;
        }

        setPosts((currentPosts) =>
          currentPosts.filter((post) => post.id !== postId),
        );

        return true;
      } catch {
        // Silently fail
        return false;
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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
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
    loadPosts,
    createPost,
    deletePost,
    deleteUser,
    promoteUser,
    demoteUser,
    isLoading,
  };
}
