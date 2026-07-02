import React, { createContext, useContext, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useMemo(() => {
    const uid = localStorage.getItem("uid");
    const username = localStorage.getItem("username");
    const clearance = localStorage.getItem("clearance");

    const user = uid
      ? {
          id: uid,
          discord_id: uid,
          username: username || "Discord User",
          full_name: username || "Discord User",
          clearance_level: clearance || "Public",
          role:
            clearance === "Administrator" || clearance === "O5"
              ? "admin"
              : "user"
        }
      : null;

    return {
      user,
      isAuthenticated: Boolean(uid),
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authChecked: true,
      authError: null,
      appPublicSettings: null,
      checkUserAuth: async () => user,
      navigateToLogin: () => {
        window.location.href = "/login";
      },
      logout: () => {
        localStorage.removeItem("uid");
        localStorage.removeItem("username");
        localStorage.removeItem("clearance");
        localStorage.removeItem("loginTime");
        sessionStorage.clear();
        window.location.href = "/login";
      }
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authChecked: true,
      authError: null,
      appPublicSettings: null,
      checkUserAuth: async () => null,
      navigateToLogin: () => {
        window.location.href = "/login";
      },
      logout: () => {
        localStorage.removeItem("uid");
        localStorage.removeItem("username");
        localStorage.removeItem("clearance");
        localStorage.removeItem("loginTime");
        sessionStorage.clear();
        window.location.href = "/login";
      }
    };
  }

  return context;
}