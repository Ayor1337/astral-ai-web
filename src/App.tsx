import type { CSSProperties } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { getUiThemeVars } from "./theme/uiTheme";

export default function App() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (token) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  const pageStyle = {
    ...getUiThemeVars(theme),
    color: "var(--text-base)",
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    background: "var(--base-bg)",
  } as CSSProperties;

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={pageStyle}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-160 w-160 rounded-full bg-linear-to-tr from-(--highlight) to-transparent opacity-10 blur-3xl mix-blend-screen" />
      </div>

      <header className="absolute top-0 flex w-full max-w-7xl items-center justify-between p-6 sm:p-10">
        <div
          className="text-xl font-bold tracking-widest"
          style={{ color: "var(--heading)" }}
        >
          ASTRAL
        </div>
      </header>

      <section className="z-10 flex flex-col items-center text-center px-4">
        <h1
          className="mb-8 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl lg:text-8xl"
          style={{ color: "var(--heading)" }}
        >
          ASTRAL AI
        </h1>
        <button
          onClick={handleStartChat}
          className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 text-base font-semibold shadow-2xl transition-all hover:scale-105 hover:shadow-(--highlight)"
          style={{
            background:
              "linear-gradient(135deg, var(--highlight-strong), var(--highlight))",
            color: "#ffffff",
          }}
        >
          <span className="relative z-10">开启对话</span>
          <svg
            className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
          <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </section>

      <footer
        className="absolute bottom-8 text-sm tracking-wider"
        style={{ color: "var(--text-footer)" }}
      >
        &copy; {new Date().getFullYear()} Astral AI. All rights reserved.
      </footer>
    </main>
  );
}
