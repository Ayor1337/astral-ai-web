import { useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { getUiThemeVars } from "@/theme/uiTheme";

export default function LoginPage() {
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const pageStyle = {
    ...getUiThemeVars(theme),
    color: "var(--text-base)",
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    background: "var(--base-bg)",
  } as CSSProperties;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={pageStyle}
    >
      <header className="absolute top-0 flex w-full max-w-6xl items-center justify-between px-6 py-8 sm:px-10 sm:py-10">
        <Link
          to="/"
          className="text-sm tracking-[0.34em]"
          style={{
            color: "var(--text-muted)",
            fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
            letterSpacing: "0.32em",
          }}
        >
          ASTRAL AI
        </Link>
      </header>

      <div
        className="w-full max-w-sm rounded-3xl border p-8 shadow-2xl"
        style={{
          background: "var(--surface)",
          borderColor: "var(--surface-border)",
          boxShadow: "0 16px 52px var(--surface-shadow)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h1
          className="mb-8 text-2xl font-semibold text-center"
          style={{ color: "var(--heading)" }}
        >
          欢迎回来
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <label
              htmlFor="username"
              className="px-1 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              用户名
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none mt-2"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-base)",
              }}
              placeholder="请输入用户名"
            />
          </div>

          <div className="space-y-2.5">
            <label
              htmlFor="password"
              className="px-1 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none mt-2"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-base)",
              }}
              placeholder="请输入密码"
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full border py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--highlight) disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background:
                "linear-gradient(120deg, var(--btn-bg-a), var(--btn-bg-b))",
              borderColor: "var(--btn-border)",
              boxShadow: "0 4px 14px var(--btn-shadow)",
              color: "var(--btn-text)",
            }}
          >
            {isLoading ? "登录中…" : "登录"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm">
          <p style={{ color: "var(--text-subtle)" }}>
            还没有账号？{" "}
            <Link
              to="/register"
              className="font-medium underline decoration-transparent underline-offset-4 transition-all hover:decoration-current"
              style={{ color: "var(--highlight)" }}
            >
              去注册
            </Link>
          </p>
          <Link
            to="/"
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
