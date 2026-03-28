import type { CSSProperties } from "react";
import { Link } from "react-router";
import { useTheme } from "@/hooks/useTheme";
import { getUiThemeVars } from "@/theme/uiTheme";

export default function RegisterPage() {
  const { theme } = useTheme();

  const pageStyle = {
    ...getUiThemeVars(theme),
    color: "var(--text-base)",
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    background: "var(--base-bg)",
  } as CSSProperties;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 lg:py-16 py-12"
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
        className="w-full max-w-sm rounded-3xl border p-8 shadow-2xl mt-8"
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
          创建账号
        </h1>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: handle register
          }}
        >
          <div className="space-y-1.5">
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
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-base)",
              }}
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="px-1 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-base)",
              }}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1.5">
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
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-base)",
              }}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="px-1 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none"
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-base)",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-full border py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--highlight)"
            style={{
              background:
                "linear-gradient(120deg, var(--btn-bg-a), var(--btn-bg-b))",
              borderColor: "var(--btn-border)",
              boxShadow: "0 4px 14px var(--btn-shadow)",
              color: "var(--btn-text)",
            }}
          >
            注册
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm">
          <p style={{ color: "var(--text-subtle)" }}>
            已有账号？{" "}
            <Link
              to="/login"
              className="font-medium underline decoration-transparent underline-offset-4 transition-all hover:decoration-current"
              style={{ color: "var(--highlight)" }}
            >
              去登录
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
