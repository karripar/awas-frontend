import { useEffect, useMemo, useState } from "react";

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

const SESSION_KEY = "awas.demo.session";

const initialUsers: UserRecord[] = [
  {
    id: "user-admin",
    username: "admin",
    email: "admin@awas.local",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user-joel",
    username: "joel",
    email: "joel@awas.local",
    password: "demo123",
    role: "user",
  },
  {
    id: "user-samu",
    username: "samu",
    email: "samu@awas.local",
    password: "demo123",
    role: "user",
  },
  {
    id: "user-karri",
    username: "karri",
    email: "karri@awas.local",
    password: "demo123",
    role: "user",
  }
];

const initialPosts: PostRecord[] = [
  {
    id: "post-1",
    userId: "user-joel",
    authorName: "joel",
    title: "Assignment scope",
    text: "Review login, feed browsing, and admin actions for the demo.",
    private: false,
    createdAt: "21-05-2026",
  },
  {
    id: "post-2",
    userId: "user-samu",
    authorName: "samu",
    title: "Private notes",
    text: "This entry should only be visible to trusted users in the real app.",
    private: true,
    createdAt: "21-05-2026",
  },
  {
    id: "post-3",
    userId: "user-admin",
    authorName: "admin",
    title: "Review checklist",
    text: "The report should mention the attack surface and the intended weak points.",
    private: false,
    createdAt: "20-05-2026",
  },
];

const defaultSession: SessionState = {
  user: null,
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadSession() {
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

export function useAwasDemoState() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [posts, setPosts] = useState<PostRecord[]>(initialPosts);
  const [session, setSession] = useState<SessionState>(loadSession);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const sessionUser = useMemo(() => session.user, [session.user]);

  const login = (username: string, password: string): AuthResult => {
    const matchedUser = users.find((user) => user.username === username);

    if (!matchedUser) {
      return { ok: false, message: "Username not found." };
    }

    if (matchedUser.password !== password) {
      return { ok: false, message: "Password incorrect." };
    }

    setSession({
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        role: matchedUser.role,
      },
    });

    return { ok: true, message: `Signed in as ${matchedUser.username}.` };
  };

  const register = ({
    username,
    email,
    password,
  }: RegisterInput): AuthResult => {
    if (users.some((user) => user.username === username)) {
      return { ok: false, message: "Username already in use." };
    }

    const newUser: UserRecord = {
      id: createId("user"),
      username,
      email,
      password,
      role: "user",
    };

    setUsers((currentUsers) => [...currentUsers, newUser]);
    setSession({
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    });

    return { ok: true, message: "Account created and signed in." };
  };

  const logout = () => {
    setSession(defaultSession);
  };

  const createPost = ({ title, text, privatePost }: PostInput): AuthResult => {
    if (!sessionUser) {
      return { ok: false, message: "Sign in before posting." };
    }

    if (!title.trim() || !text.trim()) {
      return { ok: false, message: "Title and message are required." };
    }

    const newPost: PostRecord = {
      id: createId("post"),
      userId: sessionUser.id,
      authorName: sessionUser.username,
      title: title.trim(),
      text: text.trim(),
      private: privatePost,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    return { ok: true, message: "Post published." };
  };

  const deletePost = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.id !== postId),
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    );
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post.userId !== userId),
    );

    if (sessionUser?.id === userId) {
      setSession(defaultSession);
    }
  };

  const promoteUser = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, role: "admin" } : user,
      ),
    );

    if (sessionUser?.id === userId) {
      setSession({
        user: {
          ...sessionUser,
          role: "admin",
        },
      });
    }
  };

  const demoteUser = (userId: string) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, role: "user" } : user,
      ),
    );

    if (sessionUser?.id === userId) {
      setSession({
        user: {
          ...sessionUser,
          role: "user",
        },
      });
    }
  };

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
  };
}
