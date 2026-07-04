import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMe, login as apiLogin, register as apiRegister } from "../api/auth";
import { AUTH_LOGOUT_EVENT } from "../api/client";
import { tokenStore } from "../api/tokenStore";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const access = tokenStore.getAccess();
    if (!access) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    tokenStore.set(result.access, result.refresh);
    setUser({ id: result.id, username: result.username, email: result.email, name: result.name });
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await apiRegister(name, email, password);
      tokenStore.set(result.access, result.refresh);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
