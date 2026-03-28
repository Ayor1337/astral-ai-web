import { useState } from "react";

type ColorMode = "light" | "auto" | "dark";

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "auto", label: "Auto" },
  { id: "dark", label: "Dark" },
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
  const configs: Record<
    ColorMode,
    { bg: string; sidebar: string; contentLine: string }
  > = {
    light: { bg: "#faf9f6", sidebar: "#e8e2db", contentLine: "#000" },
    auto: {
      bg: "linear-gradient(135deg, #faf9f6 50%, #262624 50%)",
      sidebar: "#e8e2db",
      contentLine: "#888",
    },
    dark: { bg: "#262624", sidebar: "#1e1e1c", contentLine: "#fff" },
  };
  const c = configs[id];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="relative h-20 w-28 overflow-hidden rounded-xl transition-all duration-200"
        style={{
          background: c.bg,
          border: selected
            ? "2px solid var(--highlight)"
            : "2px solid var(--border)",
        }}
      >
        {/* Mini sidebar strip */}
        {id !== "auto" && (
          <div
            className="absolute inset-y-0 left-0 w-6"
            style={{ background: c.sidebar }}
          />
        )}
        {/* Content lines */}
        <div
          className="absolute inset-y-0 right-0 flex flex-col justify-center gap-1.5 px-2"
          style={{ left: id !== "auto" ? "1.5rem" : "0" }}
        >
          <div
            className="h-1 w-9 rounded-full opacity-25"
            style={{ background: c.contentLine }}
          />
          <div
            className="h-1 w-7 rounded-full opacity-20"
            style={{ background: c.contentLine }}
          />
          <div
            className="h-1 w-11 rounded-full opacity-15"
            style={{ background: c.contentLine }}
          />
        </div>
        {/* Accent dot */}
        <div
          className="absolute bottom-2 right-2 h-2 w-2 rounded-full"
          style={{ background: "var(--highlight)" }}
        />
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
  const [colorMode, setColorMode] = useState<ColorMode>("auto");
  const [notifEnabled, setNotifEnabled] = useState(false);

  return (
    <div className="flex flex-col gap-10">
      {/* Profile */}
      <section className="flex flex-col gap-5">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Profile
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-base)" }}
            >
              Full name
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
                卡
              </div>
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--text-base)" }}
                defaultValue="卡川祥子"
              />
            </div>
          </div>

          {/* What should Claude call you */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-base)" }}
            >
              What should Claude call you?
            </label>
            <input
              type="text"
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-base)",
              }}
              defaultValue="卡川祥子"
            />
          </div>
        </div>

        {/* Work function */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-base)" }}
          >
            What best describes your work?
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
                Select your work function
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

        {/* Personal preferences */}
        <div className="flex flex-col gap-1.5">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-base)" }}
          >
            What personal preferences should Claude consider in responses?
          </label>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Your preferences will apply to all conversations, within{" "}
            <span
              className="cursor-pointer underline"
              style={{ color: "var(--highlight)" }}
            >
              Anthropic&apos;s guidelines
            </span>
            .
          </p>
          <textarea
            className="min-h-24 resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-base)",
            }}
            placeholder="e.g. I primarily code in Python (not a coding beginner)"
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="flex flex-col gap-4">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Notifications
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
                Response completions
              </p>
              <p
                className="max-w-sm text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Get notified when Claude has finished a response. Most useful
                for long-running tasks like tool calls and Research.
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
          Appearance
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
            Color mode
          </p>
          <div className="flex gap-4">
            {COLOR_MODES.map(({ id, label }) => (
              <ColorModeCard
                key={id}
                id={id}
                label={label}
                selected={colorMode === id}
                onClick={() => setColorMode(id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
