import { useState, useRef, useEffect } from "react";

interface Props {
  title: string;
  onRename: (title: string) => void;
  onDelete?: () => void;
  thinkingEnabled?: boolean;
}

export default function ChatHeader({ title, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const startEdit = () => {
    setDraft(title);
    setEditing(true);
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
          <div
            className="group relative flex min-w-0 items-center gap-0.5"
            ref={dropdownRef}
          >
            <h2
              className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.875rem] font-medium select-none
                         text-(--text-base) transition-colors
                         group-hover:text-(--heading) hover:bg-(--surface-active)"
              onClick={startEdit}
              title={title ? "点击编辑标题" : undefined}
            >
              {title}
            </h2>
            {title && (
              <>
                <button
                  className="flex items-center justify-center rounded-md p-1 transition-colors
                             text-(--text-muted)
                             group-hover:text-(--text-base) hover:bg-(--surface-active) hover:text-(--text-base)"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((v) => !v);
                  }}
                  aria-label="更多操作"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-1.5 min-w-28 overflow-hidden rounded-lg border border-(--surface-border) bg-(--surface) shadow-lg">
                    <button
                      className="w-full px-3 py-1.5 text-left text-[0.8125rem] text-(--text-base) transition-colors hover:bg-(--sidebar-hover)"
                      onClick={startEdit}
                    >
                      重命名
                    </button>
                    <div className="mx-2 border-t border-(--surface-border)" />
                    <button
                      className="w-full px-3 py-1.5 text-left text-[0.8125rem] text-red-400 transition-colors hover:bg-(--sidebar-hover)"
                      onClick={() => {
                        setDropdownOpen(false);
                        onDelete?.();
                      }}
                    >
                      删除
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
