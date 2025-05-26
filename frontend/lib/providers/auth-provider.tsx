"use client";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SERVER_URL } from "../server";
import { useAuthStore } from "../stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { WebSocketProvider } from "./websocket-provider";

type AuthContextType = {
  user: User | null | undefined;
  isAuthenticated: boolean;
  login: (data: LoginCredentials) => Promise<LoginResponse>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  logout: () => Promise<LogoutResponse>;
  refreshUser: () => void;
  invalidateUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const store = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useRouter();
  const pathname = usePathname();

  const isAuthPage = (path: string) => {
    return [
      "/auth/sign-in",
      "/auth/sign-up",
      "/auth/forgot-password",
      "/",
      "/blog",
    ].some(
      (authPath) =>
        authPath === path || (authPath === "/blog" && path.startsWith("/blog/"))
    );
  };

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User, Error>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/account/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          store.setUser(null);
          return null;
        }

        const userData = await response.json();
        store.setUser(userData);
        return userData;
      } catch (err) {
        throw new Error(`Error fetching user: ${err}`);
      }
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResponse> => {
      try {
        const response = await fetch(`${SERVER_URL}/api/auth/sign-in`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        if (response.ok) {
          const userData = await response.json();
          store.setUser(userData);
          queryClient.invalidateQueries({ queryKey: ["user"] });
          return { success: true, status: 200, data: userData };
        }

        if (response.status === 401) {
          return { success: false, status: 401, error: "Invalid credentials" };
        }

        return {
          success: false,
          status: response.status,
          error:
            response.status === 404 ? "User not found!" : "Invalid credentials",
        };
      } catch (error: unknown) {
        console.error("Login failed:", error);
        return { success: false, status: 500, error: "Something went wrong" };
      }
    },
    [store, queryClient]
  );

  const logout = useCallback(async (): Promise<LogoutResponse> => {
    if (!store.user && !store.isAuthenticated) {
      return { success: false, error: "No active session" };
    }

    try {
      const response = await fetch(`${SERVER_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        store.setUser(null);
        queryClient.clear();
        navigate.push("/auth/sign-in");
        return { success: true };
      }

      return {
        success: false,
        error: "Failed to logout. Please try again.",
      };
    } catch (error) {
      console.error("Logout failed:", error);
      return {
        success: false,
        error: "Network error during logout",
      };
    }
  }, [queryClient, navigate, store]);

  const refreshUser = useCallback(() => {
    refetch();
  }, [refetch]);

  const authItems = {
    user,
    login,
    isLoading,
    isAuthenticated: store.isAuthenticated,
    isError,
    error,
    logout,
    refreshUser,
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: ["user"] }),
  };

  useEffect(() => {
    if (!isLoading) {
      if (user && authItems.isAuthenticated) {
        // Redirect authenticated users away from auth pages
        if (["/auth/sign-in", "/auth/sign-up"].includes(pathname)) {
          navigate.push("/profile");
        }
      } else if (!isAuthPage(pathname)) {
        // Redirect unauthenticated users to sign-in, unless on allowed pages
        navigate.push("/auth/sign-in");
      }
    }
  }, [isLoading, user, authItems.isAuthenticated, navigate, pathname]);

  return (
    <AuthContext.Provider value={authItems}>
      <WebSocketProvider>{children}</WebSocketProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
