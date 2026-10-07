import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

const STORAGE_KEY = "prepcycle_auth";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStored()?.user || null);
  const [token, setToken] = useState(() => loadStored()?.token || null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextUser && nextToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Validate any stored token against the backend on first load.
  useEffect(() => {
    const stored = loadStored();
    if (!stored?.token) {
      setLoading(false);
      return;
    }
    api
      .me(stored.token)
      .then((data) => persist(data.user, stored.token))
      .catch(() => persist(null, null))
      .finally(() => setLoading(false));
  }, [persist]);

  const login = useCallback(
    async (email, password) => {
      const data = await api.login({ email, password });
      persist(data.user, data.token);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    return data;
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const updateUser = useCallback(
    (nextUser) => {
      persist(nextUser, token);
    },
    [persist, token]
  );

  const value = { user, token, loading, login, register, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
