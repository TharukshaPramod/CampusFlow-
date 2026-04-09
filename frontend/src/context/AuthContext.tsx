import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          roles: (payload.roles || []).map((r: string) => r.replace("ROLE_", ""))
        });
      } catch {
        localStorage.removeItem("authToken");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((jwtToken: string) => {
    localStorage.setItem("authToken", jwtToken);
    setToken(jwtToken);

    try {
      const payload = JSON.parse(atob(jwtToken.split(".")[1]));
      setUser({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        roles: (payload.roles || []).map((r: string) => r.replace("ROLE_", ""))
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

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading, login, logout]
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
