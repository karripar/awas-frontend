import { useCallback, useEffect, useMemo, useState } from "react";
import {
  dispatchSessionChanged,
  readSessionFromStorage,
  setSessionInStorage,
  clearSessionState,
} from "../lib/session.ts";

declare global {
  interface ImportMetaEnv {
      readonly VITE_API_BASE_URL?: string;
      readonly VITE_USER_ID_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
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
  const parsedSession = readSessionFromStorage() as SessionState | null;

  if (!parsedSession?.user) {
    return defaultSession;
  }

  return parsedSession;
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
  const [feedPosts, setFeedPosts] = useState<PostRecord[]>([]);
  const [searchResults, setSearchResults] = useState<PostRecord[]>([]);
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

  useEffect(() => {
    // persist session to storage and notify other listeners
    dispatchSessionChanged(session);
    setSessionInStorage(session);
  }, [session]);

  const loadFeedPosts = useCallback(
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = (await response.json()) as ApiPostsResponse;
          setFeedPosts((data.posts || []).map(convertPostRecord));
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      }
    },
    [sessionUserId],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFeedPosts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeedPosts]);


  const searchPosts = useCallback(
    async (search: string): Promise<AuthResult> => {
      const query = search.trim();

      if (!query) {
        setSearchResults([]);
        return { ok: false, message: "Enter a search term." };
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/feed?search=${encodeURIComponent(query)}`,
          {
            headers: {
              "X-User-ID": sessionUserId,
            },
          },
        );
        const data: ApiPostsResponse | ApiErrorResponse = await response.json();

        if (!response.ok) {
          const errorData = data as ApiErrorResponse;
          return {
            ok: false,
            message: errorData.error || "Search failed",
          };
        }

        const nextResults = ((data as ApiPostsResponse).posts || []).map(
          convertPostRecord,
        );
        setSearchResults(nextResults);

        return {
          ok: true,
          message: `Found ${nextResults.length} post${
            nextResults.length === 1 ? "" : "s"
          }.`,
        };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionUserId],
  );

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  useEffect(() => {
    dispatchSessionChanged(session);
    setSessionInStorage(session);
  }, [session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFeedPosts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadFeedPosts]);

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
              password: "",
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

        await loadFeedPosts();

        return { ok: true, message: "Post published." };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [loadFeedPosts, sessionUser],
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

        if (!response.ok) {
          return false;
        }

        setFeedPosts((currentPosts) =>
          currentPosts.filter((post) => post.id !== postId),
        );
        setSearchResults((currentPosts) =>
          currentPosts.filter((post) => post.id !== postId),
        );

        return true;
      } catch {
        return false;
      }
    },
    [sessionUser],
  );

  const updatePost = useCallback(
    async (
      postId: string,
      { title, text, privatePost }: PostInput,
    ): Promise<AuthResult> => {
      if (!sessionUser) {
        return { ok: false, message: "Sign in before editing." };
      }

      if (!title.trim() || !text.trim()) {
        return { ok: false, message: "Title and message are required." };
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/feed/${postId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": sessionUser.id,
          },
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
            message: errorData.error || "Failed to update post",
          };
        }

        await loadFeedPosts();

        return { ok: true, message: "Post updated." };
      } catch {
        return { ok: false, message: "Network error" };
      } finally {
        setIsLoading(false);
      }
    },
    [loadFeedPosts, sessionUser],
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

        setUsers((currentUsers) =>
          currentUsers.filter((user) => user.id !== userId),
        );

        setFeedPosts((currentPosts) =>
          currentPosts.filter((post) => post.userId !== userId),
        );
        setSearchResults((currentPosts) =>
          currentPosts.filter((post) => post.userId !== userId),
        );

        if (sessionUser?.id === userId) {
          logout();
        }
      } catch {
        // Silently fail.
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

        if (!response.ok) {
          return;
        }

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === userId ? { ...user, role: "admin" } : user,
          ),
        );

        if (sessionUser.id === userId) {
          setSession({
            user: {
              ...sessionUser,
              role: "admin",
            },
          });
        }
      } catch {
        // Silently fail.
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

        if (!response.ok) {
          return;
        }

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === userId ? { ...user, role: "user" } : user,
          ),
        );

        if (sessionUser.id === userId) {
          setSession({
            user: {
              ...sessionUser,
              role: "user",
            },
          });
        }
      } catch {
        // Silently fail.
      }
    },
    [sessionUser],
  );

  return {
    users,
    feedPosts,
    searchResults,
    session,
    login,
    register,
    logout,
    loadFeedPosts,
    searchPosts,
    clearSearchResults,
    createPost,
    updatePost,
    deletePost,
    deleteUser,
    promoteUser,
    demoteUser,
    isLoading,
  };
}
