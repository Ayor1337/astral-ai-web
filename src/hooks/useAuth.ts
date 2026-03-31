import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/types/types";
import { loginApi, registerApi, getMe } from "@/services/api";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    nickname: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  updateUserAndToken: (newToken: string, newUser: AuthUser) => void;
  updateUser: (newUser: AuthUser) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("auth_token");
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 应用启动时验证 token 有效性
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    if (!storedToken) {
      setIsInitializing(false);
      return;
    }
    getMe()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("auth_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        // token 无效，清除本地状态
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  async function login(username: string, password: string): Promise<void> {
    setIsLoading(true);
    try {
      const res = await loginApi(username, password);
      localStorage.setItem("auth_token", res.access_token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    username: string,
    nickname: string,
    password: string,
  ): Promise<void> {
    setIsLoading(true);
    try {
      const res = await registerApi(username, nickname, password);
      localStorage.setItem("auth_token", res.access_token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }

  function logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  function updateUserAndToken(newToken: string, newUser: AuthUser): void {
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function updateUser(newUser: AuthUser): void {
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setUser(newUser);
  }

  // 初始化期间渲染 null，避免路由守卫闪烁跳转
  if (isInitializing) return null;

  return createElement(
    AuthContext.Provider,
    {
      value: {
        token,
        user,
        isLoading,
        login,
        register,
        logout,
        updateUserAndToken,
        updateUser,
      },
    },
    children,
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
