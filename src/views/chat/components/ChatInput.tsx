import { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (content: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  thinkingEnabled?: boolean;
  onThinkingToggle?: () => void;
  centered?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  disabled,
  thinkingEnabled,
  onThinkingToggle,
  centered,
}: Props) {
  const [value, setValue] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 144) + "px";
  }, [value]);

  useEffect(() => {
    if (!modelOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownWrapRef.current?.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modelOpen]);  

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`w-full shrink-0 ${centered ? "mx-auto px-0 pb-0" : "mx-auto max-w-3xl px-6 pb-3"}`}
    >
      <div className="flex flex-col justify-between h-25 gap-2 rounded-[18px] border border-(--input-border) bg-(--input-bg) px-3.5 pb-2 pt-3 transition-colors duration-200 focus-within:border-(--highlight)">
        <textarea
          ref={textareaRef}
          className="max-h-36 w-full resize-none overflow-y-auto border-none bg-transparent text-[0.9375rem] leading-6 text-(--text-base) outline-none placeholder:text-(--text-footer)"
          placeholder="Reply..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <div className="flex items-center justify-between">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border border-(--input-border) bg-transparent text-(--text-muted) transition-[background,border-color] duration-100 hover:border-(--text-muted)"
            type="button"
            title="Attach file"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div ref={dropdownWrapRef} className="relative">
              <button
                className="flex items-center gap-1 border-none bg-transparent p-0 text-[0.75rem] text-(--sidebar-section-text) transition-colors duration-100 hover:text-(--text-muted)"
                type="button"
                onClick={() => setModelOpen((v) => !v)}
                aria-expanded={modelOpen}
              >
                Minimax-M2.7{thinkingEnabled ? "\u2002Extended" : ""}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-180 ${modelOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {modelOpen && (
                <div className="absolute bottom-[calc(100%+10px)] right-0 z-200 min-w-73 rounded-[14px] border border-(--surface-border) bg-(--surface-bg2) p-1.5 shadow-[0_8px_32px_var(--surface-shadow),0_2px_8px_rgba(0,0,0,0.18)] backdrop-blur-[20px]">
                  <div className="rounded-lg bg-(--surface-active) px-2.5 pb-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.875rem] font-medium text-(--text-base)">
                        Minimax-M2.7
                      </span>
                      <svg
                        className="shrink-0 text-[#007aff]"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="mt-0.5 text-[0.75rem] text-(--text-muted)">
                      Most efficient for everyday tasks
                    </p>
                  </div>

                  <div className="mx-0.5 my-1 h-px bg-(--border)" />

                  <div className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[0.875rem] font-medium text-(--text-base)">
                        Extended thinking
                      </span>
                      <span className="text-[0.75rem] text-(--text-muted)">
                        Think longer for complex tasks
                      </span>
                    </div>
                    <label
                      className="relative inline-flex cursor-pointer shrink-0"
                      title="Toggle extended thinking"
                    >
                      <input
                        type="checkbox"
                        checked={thinkingEnabled ?? false}
                        onChange={() => onThinkingToggle?.()}
                        className="peer sr-only"
                      />
                      <span
                        className={`relative h-6.5 w-11 rounded-[13px] transition-colors duration-200 ${(thinkingEnabled ?? false) ? "bg-[#007aff]" : "bg-[rgba(120,120,128,0.32)]"}`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200 ${(thinkingEnabled ?? false) ? "translate-x-4.5" : "translate-x-0"}`}
                        />
                      </span>
                    </label>
                  </div>

                  <div className="mx-0.5 my-1 h-px bg-(--border)" />

                  <button
                    className="flex w-full cursor-not-allowed items-center justify-between rounded-lg bg-transparent px-2.5 py-2 text-left text-[0.875rem] text-(--text-base) opacity-45"
                    type="button"
                    disabled
                  >
                    More models
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {disabled ? (
              <button
                className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-(--input-send-bg) text-(--text-primary) transition duration-180 hover:scale-105 hover:opacity-80"
                onClick={onStop}
                aria-label="停止生成"
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="3" y="3" width="10" height="10" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-(--input-send-bg) text-(--text-muted) transition duration-180 hover:scale-105 hover:opacity-80 disabled:cursor-not-allowed disabled:bg-(--input-send-disabled) disabled:text-(--text-footer) disabled:opacity-50"
                onClick={handleSend}
                disabled={!value.trim()}
                aria-label="发送"
                type="button"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      <p
        className={`mt-2 text-center text-[0.6875rem] text-(--disclaimer-text) ${centered ? "px-2" : "px-0"}`}
      >
        AI 可能犯错，请仔细核对回答。
      </p>
    </div>
  );
}
