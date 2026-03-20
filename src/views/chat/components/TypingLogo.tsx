import { useEffect, useState } from "react";
import { THINKING_LOGO_PATH, STREAMING_LOGO_PATH } from "./Idle";

type TypingState = "idle" | "thinking" | "streaming";

interface Props {
  state: TypingState;
  onIdleClick?: () => void;
}

export default function TypingLogo({ state, onIdleClick }: Props) {
  const [frameIndex, setFrameIndex] = useState(0);

  const frameCount = state === "streaming" ? 8 : 7;
  const visibleFrameIndex = state === "idle" ? 0 : frameIndex;
  const viewBox = state === "streaming" ? "0 0 100 800" : "0 0 100 700";
  const path = state === "streaming" ? STREAMING_LOGO_PATH : THINKING_LOGO_PATH;

  useEffect(() => {
    if (state === "idle") {
      return;
    }

    const stepMs = state === "streaming" ? 138 : 100;
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frameCount);
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [frameCount, state]);

  const sharedProps = {
    "data-typing-state": state,
    "data-typing-viewbox": viewBox,
    className:
      "h-7 w-7 shrink-0 overflow-hidden text-(--accent) transition-[opacity,filter] duration-300",
    style: {
      opacity: state === "idle" ? 0.9 : state === "streaming" ? 0.96 : 1,
      filter:
        state === "idle"
          ? "none"
          : state === "thinking"
            ? "drop-shadow(0 0 6px color-mix(in srgb, var(--accent) 82%, transparent))"
            : "drop-shadow(0 0 2px color-mix(in srgb, var(--accent) 18%, transparent))",
    },
  } as const;

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="currentColor"
      className="block h-auto w-full origin-top"
      style={{
        transform: `translateY(-${(visibleFrameIndex * 100) / frameCount}%)`,
      }}
    >
      <path d={path} />
    </svg>
  );

  if (state === "idle") {
    return (
      <button
        type="button"
        aria-label="触发思考动画"
        className="rounded-full bg-transparent p-0 text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
        onClick={onIdleClick}
      >
        <div {...sharedProps}>{svg}</div>
      </button>
    );
  }

  return (
    <div
      {...sharedProps}
      aria-label={state === "thinking" ? "AI 正在思考" : "AI 正在输出"}
      aria-live="polite"
    >
      {svg}
    </div>
  );
}
