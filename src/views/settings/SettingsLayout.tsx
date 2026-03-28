import { useState, useEffect, type CSSProperties } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useTheme } from "@/hooks/useTheme";
import { getUiThemeVars } from "@/theme/uiTheme";
import { getConversations } from "@/services/api";
import type { Conversation } from "@/types/types";
import ChatSidebar from "@/views/chat/components/ChatSidebar";

const NAV_ITEMS = [
  { path: "/settings/general", label: "总览" },
  { path: "/settings/account", label: "账号" },
] as const;

export default function SettingsLayout() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getConversations()
      .then((list) =>
        setConversations(list.map((c) => ({ id: c.id, title: c.title }))),
      )
      .catch(console.error);
  }, []);

  const pageStyle: CSSProperties = {
    ...getUiThemeVars(theme),
    fontFamily: '"Sora", "Segoe UI", sans-serif',
    color: "var(--text-base)",
    background: "var(--base-bg)",
  };

  return (
    <div className="flex h-dvh overflow-hidden" style={pageStyle}>
      <ChatSidebar
        conversations={conversations}
        activeId=""
        onSelect={(id) => navigate(`/chat/${id}`)}
        onNewChat={() => navigate("/new")}
        onDeleteConversation={() => {}}
      />

      {/* Right panel */}
      <div className="flex pl-10 py-4 flex-1 overflow-hidden">
        {/* Settings nav */}
        <nav className="w-56 shrink-0 overflow-y-auto px-4 py-10">
          <h1
            className="mb-5 text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            设置
          </h1>
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-1.5 text-sm transition-colors duration-100 ${
                      isActive ? "font-medium" : "hover:bg-(--sidebar-hover)"
                    }`
                  }
                  style={({ isActive }) => ({
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--sidebar-nav-text)",
                    background: isActive ? "var(--sidebar-active)" : undefined,
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-12 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
