import { useState, useEffect, useRef } from "react";
import type { Conversation } from "../types";
import ThemeToggle from "../../../components/ThemeToggle";

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
}

/* ── Inline SVG icons ──────────────────────────── */
const IconNewChat = () => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

const IconSearch = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconMore = () => (
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
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const IconCustomize = () => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const NAV_ITEMS = [
  { id: "new", label: "New chat", icon: <IconNewChat /> },
  { id: "search", label: "Search", icon: <IconSearch /> },
];

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  // Focus rename input when rename mode activates
  useEffect(() => {
    if (renamingId) renameInputRef.current?.select();
  }, [renamingId]);

  const startRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameText(conv.title);
  };

  const commitRename = (id: string) => {
    const trimmed = renameText.trim();
    const conv = conversations.find((c) => c.id === id);
    if (trimmed && trimmed !== conv?.title) {
      onRenameConversation?.(id, trimmed);
    }
    setRenamingId(null);
  };

  return (
    <aside className="sidebar">
      {/* ── Brand ──────────────────────────────────────────── */}
      <div className="sidebar-brand">
        <span className="sidebar-logo">Astral AI</span>
      </div>

      {/* ── Nav menu ───────────────────────────────────────── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="sidebar-nav-item"
            onClick={item.id === "new" ? onNewChat : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Recents ────────────────────────────────────────── */}
      <div className="sidebar-section-label">Recents</div>
      <div className="sidebar-recents chat-scroll">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`sidebar-conv-item ${
              conv.id === activeId ? "active" : ""
            }`}
            onClick={() => renamingId !== conv.id && onSelect(conv.id)}
          >
            {renamingId === conv.id ? (
              <input
                ref={renameInputRef}
                className="sidebar-rename-input"
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                onBlur={() => commitRename(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(conv.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="sidebar-conv-title">{conv.title}</span>
            )}

            {renamingId !== conv.id && (
              <span
                className="sidebar-conv-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                }}
              >
                <IconMore />
                {openMenuId === conv.id && (
                  <div
                    className="conv-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="conv-menu-item"
                      onClick={() => {
                        setOpenMenuId(null);
                        startRename(conv);
                      }}
                    >
                      重命名
                    </button>
                    <button
                      className="conv-menu-item conv-menu-item-danger"
                      onClick={() => {
                        setOpenMenuId(null);
                        onDeleteConversation(conv.id);
                      }}
                    >
                      删除
                    </button>
                  </div>
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── User area ────────────────────────────────────────── */}
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">长</div>
          <div className="sidebar-user-meta">
            <span className="sidebar-username">长崎素世</span>
            <span className="sidebar-plan">Owner</span>
          </div>
        </div>
        <div className="sidebar-user-actions">
          <ThemeToggle />
          <button className="sidebar-settings-btn" title="Customize">
            <IconCustomize />
          </button>
        </div>
      </div>
    </aside>
  );
}
