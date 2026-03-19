import { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (content: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  thinkingEnabled?: boolean;
  onThinkingToggle?: () => void;
}

export default function ChatInput({
  onSend,
  onStop,
  disabled,
  thinkingEnabled,
  onThinkingToggle,
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
    <div className="input-area">
      <div className="input-box">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder="Reply..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <div className="input-toolbar">
          <button
            className="input-attach-btn"
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

          <div className="input-right">
            {/* Model selector + dropdown */}
            <div ref={dropdownWrapRef} className="model-selector-wrap">
              <button
                className="input-model-selector"
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
                  style={{
                    transform: modelOpen ? "rotate(180deg)" : "none",
                    transition: "transform 180ms ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {modelOpen && (
                <div className="model-dropdown">
                  {/* Current model */}
                  <div className="model-dropdown-item model-dropdown-item--active">
                    <div className="model-dropdown-item-row">
                      <span className="model-dropdown-item-name">
                        Minimax-M2.7
                      </span>
                      <svg
                        className="model-dropdown-check"
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
                    <p className="model-dropdown-item-desc">
                      Most efficient for everyday tasks
                    </p>
                  </div>

                  <div className="model-dropdown-divider" />

                  {/* Extended thinking toggle */}
                  <div className="model-toggle-row">
                    <div className="model-toggle-info">
                      <span className="model-toggle-label">
                        Extended thinking
                      </span>
                      <span className="model-toggle-desc">
                        Think longer for complex tasks
                      </span>
                    </div>
                    <label
                      className="toggle-switch"
                      title="Toggle extended thinking"
                    >
                      <input
                        type="checkbox"
                        checked={thinkingEnabled ?? false}
                        onChange={() => onThinkingToggle?.()}
                      />
                      <span className="toggle-track">
                        <span className="toggle-thumb" />
                      </span>
                    </label>
                  </div>

                  <div className="model-dropdown-divider" />

                  {/* More models placeholder */}
                  <button
                    className="model-dropdown-more"
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
                className="input-stop-btn"
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
                className="input-send-btn"
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
      <p className="input-disclaimer">
        Astral AI is AI and can make mistakes. Please double-check responses.
      </p>
    </div>
  );
}
