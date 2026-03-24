import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import {
  getConversations,
  deleteConversation,
  updateConversationTitle,
} from "@/services/api";
import { useTheme } from "@/hooks/useTheme";
import { usePreferences } from "@/hooks/usePreferences";
import { getUiThemeVars } from "@/theme/uiTheme";
import type { Conversation } from "@/types/types";
import ChatSidebar from "@/views/chat/components/ChatSidebar";
import ChatInput from "@/views/chat/components/ChatInput";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

const PROMPTS = [
  {
    label: "写作",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: "学习",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    label: "编程",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    label: "分析",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "头脑风暴",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export default function NewChatPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { thinkingEnabled, toggleThinking } = usePreferences();

  useEffect(() => {
    getConversations()
      .then((list) =>
        setConversations(list.map((c) => ({ id: c.id, title: c.title }))),
      )
      .catch(console.error);
  }, []);

  const handleSend = useCallback(
    (content: string) => {
      navigate("/chat", {
        state: { initialMessage: content, thinkingEnabled },
      });
    },
    [navigate, thinkingEnabled],
  );

  const handlePrompt = useCallback(
    (label: string) => {
      navigate("/chat", {
        state: { initialMessage: label, thinkingEnabled },
      });
    },
    [navigate, thinkingEnabled],
  );

  const handleSelect = useCallback(
    (id: string) => {
      navigate(`/chat/${id}`);
    },
    [navigate],
  );

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleRenameConversation = useCallback(
    async (id: string, title: string) => {
      try {
        await updateConversationTitle(id, title);
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c)),
        );
      } catch (e) {
        console.error(e);
      }
    },
    [],
  );

  const pageStyle = {
    ...getUiThemeVars(theme),
    color: "var(--text-base)",
    fontFamily: '"Sora", "Segoe UI", sans-serif',
  } as CSSProperties;

  return (
    <div className="flex h-dvh overflow-hidden" style={pageStyle}>
      <ChatSidebar
        conversations={conversations}
        activeId=""
        onSelect={handleSelect}
        onNewChat={() => {}}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
      <main
        className="flex min-w-0 flex-1 items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, var(--bg-start), var(--bg-mid) 46%, var(--bg-end))",
        }}
      >
        <div className="flex w-full max-w-180 flex-col items-center px-6 sm:px-6">
          <h1
            className="mb-1.5 text-center text-[clamp(2rem,5vw,2.75rem)] font-semibold tracking-[-0.02em]"
            style={{
              color: "var(--heading)",
              fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
            }}
          >
            {getGreeting()}
          </h1>
          <p className="mb-8 text-center text-[0.9375rem] text-(--text-muted)">
            有什么我可以帮你的？
          </p>

          <div className="w-full">
            <ChatInput
              onSend={handleSend}
              thinkingEnabled={thinkingEnabled}
              onThinkingToggle={toggleThinking}
              centered
            />
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--surface) px-4 py-1.75 text-[0.8125rem] text-(--text-secondary) backdrop-blur-sm transition-[border-color,background,color] duration-150 hover:bg-(--surface-active) hover:text-(--text-base)"
                type="button"
                onClick={() => handlePrompt(p.label)}
              >
                {p.icon}
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
