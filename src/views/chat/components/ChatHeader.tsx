import { useState, useRef, useEffect } from "react";

interface Props {
  title: string;
  onRename: (title: string) => void;
  thinkingEnabled?: boolean;
}

export default function ChatHeader({
  title,
  onRename,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(title);
    setEditing(true);
  };

  useEffect(() => {
    if (editing) {
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        {editing ? (
          <input
            ref={inputRef}
            className="header-title-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <>
            <h2
              className="header-title"
              onDoubleClick={startEdit}
              title={title ? "双击编辑标题" : undefined}
            >
              {title}
            </h2>
            {title && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--text-muted)", marginTop: 2 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </>
        )}
      </div>
    </header>
  );
}
