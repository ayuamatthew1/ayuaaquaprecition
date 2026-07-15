import { getApiUrl } from "@/src/lib/api";
import type { AuthSession, AuthUser } from "@/src/types/auth";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type AuthProviderProps = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const TOKEN_KEY = "auth_access_token";
const AuthContext = createContext<AuthProviderProps | undefined>(undefined);

const getToken = async () => {
  if (Platform.OS === "web") return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  return SecureStore.getItemAsync(TOKEN_KEY);
};

const saveToken = async (token: string) => {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

const deleteToken = async () => {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = user !== null;

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(getApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result: ApiResponse<AuthUser> = await response.json();

        if (!response.ok || !result.success || !result.data) {
          await deleteToken();
          return;
        }

        setUser(result.data);
      } catch {
        await deleteToken();
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    const response = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const result: ApiResponse<AuthSession> = await response.json();

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message ?? "Invalid email or password.");
    }

    await saveToken(result.data.accessToken);
    setUser(result.data.user);
  };

  const signOut = async () => {
    await deleteToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, signIn, signOut, loading }),
    [isAuthenticated, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthProviderProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
