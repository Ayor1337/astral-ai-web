import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/theme/uiTheme";

type ColorMode = "light" | "auto" | "dark";

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "light", label: "浅色" },
  { id: "auto", label: "自动" },
  { id: "dark", label: "深色" },
];

const IconChevronDown = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function CardContent({ mode }: { mode: "light" | "dark" }) {
  const bg = mode === "light" ? "#faf9f6" : "#262624";
  const sidebar = mode === "light" ? "#e8e2db" : "#1e1e1c";
  const contentLine = mode === "light" ? "#000" : "#fff";

  return (
    <div className="absolute inset-0" style={{ background: bg }}>
      {/* Mini sidebar strip */}
      <div
        className="absolute inset-y-0 left-0 w-6"
        style={{ background: sidebar }}
      />
      {/* Content lines */}
      <div
        className="absolute inset-y-0 right-0 flex flex-col justify-center gap-1.5 px-2"
        style={{ left: "1.5rem" }}
      >
        <div
          className="h-1 w-9 rounded-full opacity-25"
          style={{ background: contentLine }}
        />
        <div
          className="h-1 w-7 rounded-full opacity-20"
          style={{ background: contentLine }}
        />
        <div
          className="h-1 w-11 rounded-full opacity-15"
          style={{ background: contentLine }}
        />
      </div>
      {/* Accent dot */}
      <div
        className="absolute bottom-2 right-2 h-2 w-2 rounded-full"
        style={{ background: "var(--highlight)" }}
      />
    </div>
  );
}

function ColorModeCard({
  id,
  label,
  selected,
  onClick,
}: {
  id: ColorMode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="relative h-20 w-28 overflow-hidden rounded-xl transition-all duration-200"
        style={{
          border: selected
            ? "2px solid var(--highlight)"
            : "2px solid var(--border)",
        }}
      >
        {id === "auto" ? (
          <>
            <CardContent mode="light" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
            >
              <CardContent mode="dark" />
            </div>
          </>
        ) : (
          <CardContent mode={id} />
        )}
      </div>
      <span
        className="text-xs"
        style={{
          color: selected ? "var(--text-primary)" : "var(--text-muted)",
          fontWeight: selected ? 500 : 400,
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function SettingsGeneral() {
  const { theme, setTheme } = useTheme();
  const [notifEnabled, setNotifEnabled] = useState(false);

  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    try {
      const stored = localStorage.getItem("astral-color-mode");
      if (stored === "auto") return "auto";
    } catch {
      /* ignore */
    }
    return theme as ColorMode;
  });

  const handleColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    if (mode === "auto") {
      try {
        localStorage.setItem("astral-color-mode", "auto");
      } catch {
        /* ignore */
      }
      const systemLight = window.matchMedia?.(
        "(prefers-color-scheme: light)",
      ).matches;
      setTheme(systemLight ? "light" : "dark");
    } else {
      try {
        localStorage.removeItem("astral-color-mode");
      } catch {
        /* ignore */
      }
      setTheme(mode as Theme);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Profile */}
      <section className="flex flex-col gap-5">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          个人资料
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-base)" }}
            >
              全名
            </label>
            <div
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: "var(--user-avatar-bg)" }}
              >
                長
              </div>
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-base)" }}
                defaultValue="長崎そよ"
              />
            </div>
          </div>

          {/* Claude 应该如何称呼你 */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-base)" }}
            >
              应该如何称呼你？
            </label>
            <input
              type="text"
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-base)",
              }}
              defaultValue="長崎そよ"
            />
          </div>
        </div>

        {/* Work function */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-base)" }}
          >
            如何描述你的工作？
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              defaultValue=""
            >
              <option value="" disabled>
                选择你的工作职能
              </option>
            </select>
            <div
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
              style={{ color: "var(--text-muted)" }}
            >
              <IconChevronDown />
            </div>
          </div>
        </div>

        {/* 个人偏好 */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-base)" }}
          >
            在回答中应考虑哪些个人偏好？
          </label>
          <textarea
            className="min-h-24 resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-base)",
            }}
            placeholder="例如：我主要使用 Python 编程（不是编程初学者）"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          通知
        </h2>
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-base)" }}
              >
                响应完成
              </p>
              <p
                className="max-w-sm text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                当 Claude
                完成响应时收到通知。对于长时间运行的任务（如工具调用和研究）最有用。
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifEnabled}
              onClick={() => setNotifEnabled((v) => !v)}
              className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
              style={{
                background: notifEnabled
                  ? "var(--highlight)"
                  : "var(--surface-border)",
              }}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  notifEnabled ? "translate-x-4" : "translate-x-0"
                }`}
                style={{ left: "2px" }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          外观
        </h2>
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="mb-4 text-sm font-medium"
            style={{ color: "var(--text-base)" }}
          >
            颜色模式
          </p>
          <div className="flex gap-4">
            {COLOR_MODES.map(({ id, label }) => (
              <ColorModeCard
                key={id}
                id={id}
                label={label}
                selected={colorMode === id}
                onClick={() => handleColorMode(id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
