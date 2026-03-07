import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, User } from "../types";
import api from "../services/api-client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // ✅ Add this

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>; // ✅ Add this
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false, // ✅ Add this

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const response = await api.post<AuthResponse>("/auth/login", {
            email,
            password,
          });

          const { accessToken, refreshToken, user } = response.data;

          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await api.post("/auth/logout", { refreshToken });
          }
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      fetchMe: async () => {
        try {
          console.log("🔍 Fetching /auth/me..."); // ✅ Add this

          const response = await api.get<{ success: boolean; user: User }>(
            "/auth/me",
          );

          console.log("✅ /auth/me response:", response.data); // ✅ Add this

          set({
            user: response.data.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error(
            "❌ /auth/me failed:",
            error.response?.data || error.message,
          ); // ✅ Add this

          // Token is invalid, logout
          get().logout();
          throw error;
        }
      },
      // ✅ Add initialize method
      initialize: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ isInitialized: true });
          return;
        }

        try {
          await get().fetchMe();
          set({ isInitialized: true });
        } catch (error) {
          console.error("Auth initialization failed:", error);
          set({
            isInitialized: true,
            isAuthenticated: false,
            user: null,
          });
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
