import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const raw = localStorage.getItem("hp_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("hp_token"));
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("hp_user", JSON.stringify(data.user));
      } catch (err) {
        localStorage.removeItem("hp_token");
        localStorage.removeItem("hp_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const login = async (payload) => {
    setError(null);
    const { data } = await api.post("/auth/login", payload);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("hp_token", data.token);
    localStorage.setItem("hp_user", JSON.stringify(data.user));
  };

  const register = async (payload) => {
    setError(null);
    const { data } = await api.post("/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("hp_token", data.token);
    localStorage.setItem("hp_user", JSON.stringify(data.user));
  };

  const logout = () => {
    localStorage.removeItem("hp_token");
    localStorage.removeItem("hp_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, loading, error, login, register, logout, setError }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
