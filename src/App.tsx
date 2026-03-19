import type { CSSProperties } from "react";
import { Link } from "react-router";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./hooks/useTheme";
import { getUiThemeVars } from "./theme/uiTheme";

export default function App() {
  const { theme } = useTheme();

  const pageStyle = {
    ...getUiThemeVars(theme),
    color: "var(--text-base)",
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    background:
      "radial-gradient(circle at 82% 8%, var(--radial-a), transparent 35%), radial-gradient(circle at 15% 74%, var(--radial-b), transparent 36%), linear-gradient(140deg, var(--bg-start), var(--bg-mid) 46%, var(--bg-end))",
  } as CSSProperties;

  return (
    <main className="relative isolate min-h-screen overflow-hidden" style={pageStyle}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-24 -z-10 h-88 w-88 rounded-full bg-[var(--ambient-a)] blur-[54px] max-sm:blur-[46px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-[6%] -z-10 h-76 w-76 rounded-full bg-[var(--ambient-b)] blur-[54px] max-sm:blur-[46px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[34%] top-[38%] -z-10 h-64 w-64 rounded-full bg-[var(--ambient-c)] blur-[54px] max-sm:blur-[46px]"
      />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 pb-10 pt-8 sm:px-10 sm:pb-14 sm:pt-10">
        <header className="flex items-center justify-between">
          <div
            className="text-sm tracking-[0.34em]"
            style={{
              color: "var(--text-muted)",
              fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
              letterSpacing: "0.32em",
            }}
          >
            ASTRAL AI
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div
              className="text-xs uppercase tracking-[0.26em]"
              style={{ color: "var(--text-subtle)" }}
            >
              Chat Native
            </div>
          </div>
        </header>

        <div className="grid gap-12 pb-6 pt-14 md:grid-cols-[1.2fr_0.8fr] md:items-end md:pt-20">
          <div className="space-y-8">
            <p
              className="text-xs uppercase tracking-[0.34em]"
              style={{ color: "var(--text-tag)" }}
            >
              Calm. Fast. Focused.
            </p>

            <h1
              className="text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-7xl"
              style={{ color: "var(--heading)" }}
            >
              让 AI 对话
              <br />
              像深空航行一样顺滑
            </h1>

            <p
              className="max-w-xl text-base leading-7 sm:text-lg"
              style={{ color: "var(--text-muted)" }}
            >
              一个为高频沟通设计的 AI 聊天入口。少打扰、低负担、强沉浸，让你把注意力留给真正重要的问题。
            </p>

            <div>
              <Link
                to="/chat"
                className="inline-flex items-center gap-3 rounded-full border px-7 py-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--highlight)]"
                style={{
                  background:
                    "linear-gradient(120deg, var(--btn-bg-a), var(--btn-bg-b))",
                  borderColor: "var(--btn-border)",
                  boxShadow: "0 10px 30px var(--btn-shadow)",
                  color: "var(--btn-text)",
                }}
              >
                进入对话
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <aside
            className="self-start rounded-3xl border p-6 md:self-end"
            style={{
              background:
                "linear-gradient(160deg, var(--surface-bg2), var(--surface))",
              borderColor: "var(--surface-border)",
              boxShadow: "0 16px 52px var(--surface-shadow)",
              backdropFilter: "blur(9px)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-tag)" }}>
              Today
            </p>
            <p className="mt-3 text-4xl font-semibold" style={{ color: "var(--heading)" }}>
              24/7
            </p>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-muted)" }}>
              连续在线的对话引擎，适合创作、分析与即时决策。
            </p>
            <div
              className="mt-6 h-px w-full"
              style={{
                background:
                  "linear-gradient(to right, var(--card-divider-from), var(--card-divider-via), transparent)",
              }}
            />
            <p className="mt-5 text-sm" style={{ color: "var(--text-subtle)" }}>
              单一主操作，避免按钮堆叠带来的注意力分散。
            </p>
          </aside>
        </div>

        <footer
          className="grid gap-4 border-t pt-6 text-xs tracking-[0.2em] sm:grid-cols-3"
          style={{ borderColor: "var(--divider)", color: "var(--text-footer)" }}
        >
          <span>INTENT-FIRST UI</span>
          <span>LOW-CLUTTER INTERACTION</span>
          <span>RESPONSIVE EXPERIENCE</span>
        </footer>
      </section>
    </main>
  );
}
