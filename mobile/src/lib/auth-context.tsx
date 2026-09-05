import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import type { User } from "@/lib/types";
import {
  login as apiLogin,
  logout as apiLogout,
  getMe,
  getAccessToken,
  clearTokens,
} from "@/lib/api";

// ─── State ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOADING" }
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true, error: null };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "CLEAR_USER":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          dispatch({ type: "CLEAR_USER" });
          return;
        }
        const user = await getMe();
        dispatch({ type: "SET_USER", payload: user });
      } catch {
        await clearTokens();
        dispatch({ type: "CLEAR_USER" });
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: "LOADING" });
    try {
      await apiLogin(email, password);
      const user = await getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      dispatch({ type: "SET_ERROR", payload: message });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: "LOADING" });
    try {
      await apiLogout();
    } catch {
      // Swallow logout errors — tokens are cleared regardless
    } finally {
      dispatch({ type: "CLEAR_USER" });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch {
      await clearTokens();
      dispatch({ type: "CLEAR_USER" });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, clearError, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
