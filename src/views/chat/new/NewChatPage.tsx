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
import NewPageChatInput from "./components/NewPageChatInput";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

export default function NewChatPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { thinkingEnabled, toggleThinking, searchEnabled, toggleSearch } =
    usePreferences();
  // exc
  const username = "长期素世";

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
        state: { initialMessage: content, thinkingEnabled, searchEnabled },
      });
    },
    [navigate, thinkingEnabled, searchEnabled],
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
        style={{ background: "var(--base-bg)" }}
      >
        <div className="flex w-full max-w-180 flex-col items-center px-6 sm:px-6">
          <h1
            className="mb-6 text-center text-[clamp(2rem,5vw,2.75rem)] font-semibold tracking-[-0.02em]"
            style={{
              color: "var(--heading)",
              fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
            }}
          >
            {getGreeting()}, {username}
          </h1>

          <div className="w-full">
            <NewPageChatInput
              onSend={handleSend}
              thinkingEnabled={thinkingEnabled}
              onThinkingToggle={toggleThinking}
              searchEnabled={searchEnabled}
              onSearchToggle={toggleSearch}
              centered
            />
          </div>
        </div>
      </main>
    </div>
  );
}
