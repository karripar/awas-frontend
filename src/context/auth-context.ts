import { createContext } from "react";
import type { SessionUser } from "../hooks/useBlogApi.ts";

export type StoredSession = { user?: SessionUser } | null;

export type AuthContextType = {
  user: SessionUser | null;
};

export const AuthContext = createContext<AuthContextType>({ user: null });
