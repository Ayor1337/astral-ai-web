import { Link } from "react-router";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  return (
    <main
      className="home-page relative min-h-screen overflow-hidden"
      style={{ color: "var(--text-base)" }}
    >
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 pb-10 pt-8 sm:px-10 sm:pb-14 sm:pt-10">
        <header className="fade-up flex items-center justify-between">
          <div
            className="brand-mark text-sm tracking-[0.34em]"
            style={{ color: "var(--text-muted)" }}
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
              className="fade-up text-xs uppercase tracking-[0.34em] [animation-delay:120ms]"
              style={{ color: "var(--text-tag)" }}
            >
              Calm. Fast. Focused.
            </p>

            <h1
              className="fade-up text-balance text-4xl font-semibold leading-[1.08] [animation-delay:200ms] sm:text-5xl lg:text-7xl"
              style={{ color: "var(--heading)" }}
            >
              让 AI 对话
              <br />
              像深空航行一样顺滑
            </h1>

            <p
              className="fade-up max-w-xl text-base leading-7 [animation-delay:320ms] sm:text-lg"
              style={{ color: "var(--text-muted)" }}
            >
              一个为高频沟通设计的 AI
              聊天入口。少打扰、低负担、强沉浸，让你把注意力留给真正重要的问题。
            </p>

            <div className="fade-up [animation-delay:420ms]">
              <Link
                to="/chat"
                className="launch-btn inline-flex items-center gap-3 rounded-full px-7 py-3 text-sm font-medium"
              >
                进入对话
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <aside className="fade-up stat-card self-start rounded-3xl p-6 [animation-delay:300ms] md:self-end">
            <p
              className="text-xs uppercase tracking-[0.24em]"
              style={{ color: "var(--text-tag)" }}
            >
              Today
            </p>
            <p
              className="mt-3 text-4xl font-semibold"
              style={{ color: "var(--heading)" }}
            >
              24/7
            </p>
            <p
              className="mt-3 text-sm leading-6"
              style={{ color: "var(--text-muted)" }}
            >
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
          className="fade-up grid gap-4 border-t pt-6 text-xs tracking-[0.2em] sm:grid-cols-3 [animation-delay:520ms]"
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
