import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      className="theme-toggle-btn"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDark ? "☀" : "☽"}
    </button>
  );
}
