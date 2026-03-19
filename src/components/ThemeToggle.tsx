import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-(--surface-border) bg-(--surface) text-[0.9rem] text-(--text-muted) transition-[background,border-color,opacity] duration-200 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--highlight)"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "切换到浅色模式" : "切换到深色模式"}
      type="button"
    >
      {isDark ? "☀" : "☽"}
    </button>
  );
}
