import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api/client";

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: string[];
}

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (jwtToken: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeRoles = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => String(value).replace("ROLE_", "").trim())
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((value) => value.replace("ROLE_", "").trim())
      .filter(Boolean);
  }

  return [];
};

const decodeUserFromToken = (jwtToken: string): User => {
  const payload = JSON.parse(atob(jwtToken.split(".")[1]));
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    roles: normalizeRoles(payload.roles)
  };
};

const mapUserFromApi = (data: any, fallback?: User | null): User => ({
  id: data?.id || fallback?.id || "",
  email: data?.email || fallback?.email || "",
  name: data?.name || fallback?.name || "",
  picture: data?.picture ?? fallback?.picture,
  roles: normalizeRoles(data?.roles ?? data?.roleSet ?? fallback?.roles ?? ["USER"])
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("authToken");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);

      let fallbackUser: User | null = null;
      try {
        fallbackUser = decodeUserFromToken(savedToken);
        setUser(fallbackUser);
      } catch {
        localStorage.removeItem("authToken");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/users/me");
        setUser(mapUserFromApi(res.data, fallbackUser));
      } catch {
        // Keep decoded token values if backend profile fetch is unavailable.
        setUser(fallbackUser);
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const login = useCallback((jwtToken: string) => {
    localStorage.setItem("authToken", jwtToken);
    setToken(jwtToken);

    try {
      const fallbackUser = decodeUserFromToken(jwtToken);
      setUser(fallbackUser);

      void api
        .get("/users/me")
        .then((res) => {
          setUser(mapUserFromApi(res.data, fallbackUser));
        })
        .catch(() => {
          setUser(fallbackUser);
        });
    } catch (e) {
      console.error("Failed to decode JWT", e);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, updateUser, logout }),
    [user, token, loading, login, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
