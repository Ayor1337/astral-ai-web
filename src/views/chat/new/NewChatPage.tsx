import {
  useState,
  useCallback,
  useEffect,
  type CSSProperties,
  useRef,
} from "react";
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
import TypingLogo from "../components/TypingLogo";

function getGreeting() {
  const hour = new Date().getHours();

  const greetings = {
    early: [
      "早安，指挥官。今天的星舰已就绪",
      "新的一天从一杯咖啡开始",
      "清晨的露珠在等你探索",
      "起床气消散了吗？来聊聊天吧",
    ],
    morning: [
      "上午好！今天想探索什么话题？",
      "阳光正好，思路也正好",
      "工作学习之余，也别忘了休息哦",
      "这个时间点，适合来场思维碰撞",
    ],
    noon: [
      "午休时间要来杯茶吗？",
      "中午好！补充能量的时刻到啦",
      "午餐后适合发会儿呆~",
      "太阳当空照，我来陪你聊",
    ],
    afternoon: [
      "下午好！困意来袭前高效一把？",
      "下午的咖啡或茶，准备好了吗？",
      "来聊聊下午茶的搭配吧~",
      "午后时光，适合轻松一下",
    ],
    evening: [
      "傍晚好！今天的收获如何？",
      "夕阳西下，思绪纷飞",
      "夜幕降临前，还有什么想聊的？",
      "傍晚的风很舒服，来唠唠嗑~",
    ],
    night: [
      "夜深了还在奋斗？注意休息哦",
      "深夜来访者，必有有趣灵魂",
      "月亮不睡我不睡，陪你聊到天亮",
      "夜猫子出没！今晚想聊什么？",
    ],
  };

  let category: keyof typeof greetings;
  if (hour < 6) category = "night";
  else if (hour < 9) category = "early";
  else if (hour < 12) category = "morning";
  else if (hour < 14) category = "noon";
  else if (hour < 18) category = "afternoon";
  else if (hour < 22) category = "evening";
  else category = "night";

  const list = greetings[category];
  return list[Math.floor(Math.random() * list.length)];
}

export default function NewChatPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { thinkingEnabled, toggleThinking, searchEnabled, toggleSearch } =
    usePreferences();
  const [isIdleThinking, setIsIdleThinking] = useState(false);
  const idleThinkingTimeoutRef = useRef<number | null>(null);

  const handleIdleLogoClick = useCallback(() => {
    if (idleThinkingTimeoutRef.current != null) {
      window.clearTimeout(idleThinkingTimeoutRef.current);
    }
    setIsIdleThinking(true);
    idleThinkingTimeoutRef.current = window.setTimeout(() => {
      setIsIdleThinking(false);
      idleThinkingTimeoutRef.current = null;
    }, 700);
  }, []);

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
          <div className="flex items-center gap-4 mb-6">
            <TypingLogo
              state={isIdleThinking ? "thinking" : "idle"}
              onIdleClick={handleIdleLogoClick}
            />
            <h1
              className="text-center text-[clamp(1.5rem,4vw,2rem)] font-normal tracking-[-0.02em]"
              style={{
                color: theme === "dark" ? "#C2C0B6" : "#3D3D3A",
                fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
              }}
            >
              {getGreeting()}
            </h1>
          </div>

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
