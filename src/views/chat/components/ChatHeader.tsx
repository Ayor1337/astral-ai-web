import { useState, useRef, useEffect } from "react";

interface Props {
  title: string;
  onRename: (title: string) => void;
  thinkingEnabled?: boolean;
}

export default function ChatHeader({ title, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(title);
    setEditing(true);
  };

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-(--header-border) bg-transparent px-5 py-3">
      <div className="flex min-w-0 items-center gap-1.5">
        {editing ? (
          <input
            ref={inputRef}
            className="min-w-0 w-60 rounded-md border border-(--surface-border) bg-(--surface) px-2 py-0.5 text-[0.875rem] font-medium text-(--text-base) outline-none focus:border-(--highlight)"
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
              className="cursor-default overflow-hidden text-ellipsis whitespace-nowrap text-[0.875rem] font-medium text-(--text-base) select-none"
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
                className="mt-0.5 text-(--text-muted)"
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

