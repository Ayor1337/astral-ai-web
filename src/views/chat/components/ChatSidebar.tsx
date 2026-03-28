import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Conversation } from "@/types/types.ts";

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation?: (id: string, title: string) => void;
}

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

const IconPanelLeft = () => (
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
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
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
  { id: "new", label: "新建聊天", icon: <IconNewChat /> },
  { id: "search", label: "搜索", icon: <IconSearch /> },
];

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
}: Props) {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatsCollapsed, setChatsCollapsed] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

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
    <aside
      className={`flex shrink-0 flex-col overflow-hidden border-r border-(--sidebar-border) bg-(--sidebar-bg) transition-[width] duration-300 ease-in-out ${
        sidebarCollapsed ? "w-14" : "w-65"
      }`}
    >
      {/* Header */}
      <div className="relative flex h-13 shrink-0 items-center overflow-hidden">
        <div
          className={`absolute left-0 flex w-65 items-center justify-between px-4 transition-opacity duration-300 ${
            sidebarCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <span
            className="whitespace-nowrap text-base font-semibold tracking-[0.02em] text-(--text-base)"
            style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}
          >
            Astral AI
          </span>
          <div className="h-7 w-7 shrink-0" />
        </div>

        <button
          className={`absolute flex h-7 w-7 items-center justify-center rounded-md text-(--sidebar-nav-text) transition-all duration-300 hover:bg-(--sidebar-hover) ${
            sidebarCollapsed ? "left-3.5" : "left-54"
          }`}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          type="button"
        >
          <IconPanelLeft />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-px px-2 pb-3 pt-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="relative flex h-8.5 w-full items-center rounded-lg text-[0.8125rem] text-(--sidebar-nav-text) transition-colors duration-100 hover:bg-(--sidebar-hover)"
            onClick={item.id === "new" ? onNewChat : undefined}
            title={sidebarCollapsed ? item.label : undefined}
            type="button"
          >
            <div
              className={`absolute flex items-center justify-center transition-all duration-300 ${
                sidebarCollapsed ? "left-3" : "left-2.5"
              }`}
            >
              {item.icon}
            </div>

            <span
              className={`absolute left-9 whitespace-nowrap transition-opacity duration-300 ${
                sidebarCollapsed
                  ? "pointer-events-none opacity-0"
                  : "opacity-100"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Middle section — always flex-1 to push bottom bar down */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className={`flex w-65 flex-1 flex-col transition-opacity duration-300 ${
            sidebarCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {/* Recent chats header */}
          <div
            className="group/chatsheader flex cursor-pointer select-none items-center gap-2 px-4.5 pb-1.5 pt-2.5"
            onClick={() => setChatsCollapsed(!chatsCollapsed)}
          >
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-(--sidebar-section-text)">
              最近聊天
            </span>
            <div className="text-[0.6875rem] text-(--sidebar-nav-text) opacity-0 transition-opacity duration-150 group-hover/chatsheader:opacity-100">
              {chatsCollapsed ? "显示" : "隐藏"}
            </div>
          </div>

          {/* Conversation list — fade in/out */}
          <div
            className={`flex flex-1 flex-col gap-px overflow-y-auto px-2 transition-opacity duration-200 ${
              chatsCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <div
                  key={conv.id}
                  className={`group/conv flex min-h-8.5 w-full items-center justify-between rounded-lg px-2.5 py-1.75 text-left transition-colors duration-100 ${
                    isActive
                      ? "bg-(--sidebar-active)"
                      : "bg-transparent hover:bg-(--sidebar-hover)"
                  }`}
                  onClick={() => renamingId !== conv.id && onSelect(conv.id)}
                >
                  {renamingId === conv.id ? (
                    <input
                      ref={renameInputRef}
                      className="min-w-0 flex-1 rounded-md border border-(--highlight) bg-(--surface) px-1.5 py-0.5 text-[0.8125rem] text-(--text-base) outline-none"
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
                    <span className="min-w-0 flex-1 select-none overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] text-(--text-base)">
                      {conv.title}
                    </span>
                  )}

                  {renamingId !== conv.id && (
                    <span
                      className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-(--sidebar-nav-text) opacity-0 transition-[opacity,background] duration-100 group-hover/conv:opacity-100 hover:bg-(--sidebar-hover)"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                      }}
                    >
                      <IconMore />
                      {openMenuId === conv.id && (
                        <div
                          className="absolute right-0 top-[calc(100%+4px)] z-100 min-w-25 rounded-lg border border-(--surface-border) bg-(--surface-bg2) p-1 shadow-[0_4px_16px_var(--surface-shadow)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="block w-full rounded-md px-2.5 py-1.5 text-left text-[0.8125rem] text-(--text-base) transition-colors duration-100 hover:bg-(--sidebar-hover)"
                            onClick={() => {
                              setOpenMenuId(null);
                              startRename(conv);
                            }}
                            type="button"
                          >
                            重命名
                          </button>
                          <button
                            className="block w-full rounded-md px-2.5 py-1.5 text-left text-[0.8125rem] text-[#e05c5c] transition-colors duration-100 hover:bg-[rgba(224,92,92,0.12)]"
                            onClick={() => {
                              setOpenMenuId(null);
                              onDeleteConversation(conv.id);
                            }}
                            type="button"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative flex h-13 shrink-0 items-center overflow-hidden border-t border-(--sidebar-border)">
        <div
          className={`absolute left-0 flex w-65 items-center justify-between px-3 transition-opacity duration-300 ${
            sidebarCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="h-7 w-7 shrink-0 opacity-0" />
            <div className="flex min-w-0 flex-col">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-medium text-(--text-base)">
                長崎そよ
              </span>
              <span className="text-[0.6875rem] text-(--sidebar-section-text)">
                Tester
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md text-(--sidebar-nav-text) transition-colors duration-100 hover:bg-(--sidebar-hover)"
              title="Customize"
              type="button"
              onClick={() => navigate("/settings/general")}
            >
              <IconCustomize />
            </button>
          </div>
        </div>

        <div
          className={`absolute flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white transition-all duration-300 ${
            sidebarCollapsed ? "left-3.5" : "left-3"
          }`}
          style={{ background: "var(--user-avatar-bg)" }}
        >
          長
        </div>
      </div>
    </aside>
  );
}
