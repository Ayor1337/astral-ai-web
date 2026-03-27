import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
} from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import type {
  Message,
  Conversation,
  MessageAPI,
  TraceStep,
} from "@/types/types";
import {
  getConversations,
  getConversationDetail,
  updateConversationTitle,
  deleteConversation,
  streamChat,
  stopChatRun,
} from "@/services/api";
import { useTheme } from "@/hooks/useTheme";
import { usePreferences } from "@/hooks/usePreferences";
import { getUiThemeVars } from "@/theme/uiTheme";
import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

function mergeStreamingText(previous: string, incoming: string) {
  if (!previous) return incoming;
  if (!incoming) return previous;

  // Some backends stream full snapshots, not deltas.
  if (incoming.startsWith(previous)) return incoming;

  const maxOverlap = Math.min(previous.length, incoming.length);
  for (let size = maxOverlap; size > 0; size -= 1) {
    if (previous.endsWith(incoming.slice(0, size))) {
      return previous + incoming.slice(size);
    }
  }

  return previous + incoming;
}

export default function ChatView() {
  const { theme } = useTheme();
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(urlId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const {
    thinkingEnabled,
    setThinkingEnabled,
    toggleThinking,
    searchEnabled,
    toggleSearch,
  } = usePreferences();

  const firstChunkRef = useRef(false);
  const streamingMsgIdRef = useRef<string | null>(null);
  const runIdRef = useRef<string | null>(null);
  const skipUrlLoadRef = useRef(false);
  const activeIdRef = useRef<string | null>(urlId ?? null);
  const autoSentRef = useRef(false);

  const mapAPIMessages = useCallback(
    (convId: string, msgs: MessageAPI[]): Message[] =>
      msgs.map((m) => ({
        id: `${convId}-${m.sequence}`,
        role: m.role,
        content: m.content,
        traceSteps: m.trace_steps ?? undefined,
        ts: m.created_at,
      })),
    [],
  );

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    getConversations()
      .then((list) => {
        const convs = list.map((c) => ({ id: c.id, title: c.title }));
        setConversations(convs);
        if (!urlId && convs.length > 0 && !autoSentRef.current) {
          navigate(`/chat/${convs[0].id}`, { replace: true });
        }
      })
      .catch(console.error);
  }, [navigate, urlId]);

  useEffect(() => {
    if (!urlId) {
      queueMicrotask(() => {
        setActiveId(null);
        setMessages([]);
      });
      return;
    }
    if (skipUrlLoadRef.current) {
      skipUrlLoadRef.current = false;
      queueMicrotask(() => {
        setActiveId(urlId);
      });
      return;
    }
    queueMicrotask(() => {
      setActiveId(urlId);
      setMessages([]);
    });
    getConversationDetail(urlId)
      .then((detail) => setMessages(mapAPIMessages(detail.id, detail.messages)))
      .catch(console.error);
  }, [urlId, mapAPIMessages]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const isBusy = isTyping || streamingMsgId !== null;

  const handleSend = useCallback(
    (content: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        ts: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      firstChunkRef.current = false;
      streamingMsgIdRef.current = null;

      streamChat(activeId, content, thinkingEnabled, searchEnabled, {
        onConversation: (conversationId, title, runId) => {
          runIdRef.current = runId;
          if (activeIdRef.current === null) {
            skipUrlLoadRef.current = true;
            navigate(`/chat/${conversationId}`, { replace: true });
          }
          setActiveId((prev) => (prev === null ? conversationId : prev));
          setConversations((prev) => {
            if (prev.find((c) => c.id === conversationId)) return prev;
            return [{ id: conversationId, title }, ...prev];
          });
        },
        onChunk: (chunk) => {
          if (!firstChunkRef.current) {
            firstChunkRef.current = true;
            setIsTyping(false);
            const msgId = `ai-${Date.now()}`;
            streamingMsgIdRef.current = msgId;
            setStreamingMsgId(msgId);
            setMessages((prev) => [
              ...prev,
              {
                id: msgId,
                role: "assistant",
                content: chunk,
                ts: new Date().toISOString(),
              },
            ]);
          } else {
            const msgId = streamingMsgIdRef.current;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, content: m.content + chunk } : m,
              ),
            );
          }
        },
        onTraceStep: (step: TraceStep) => {
          if (!streamingMsgIdRef.current) {
            const msgId = `ai-${Date.now()}`;
            streamingMsgIdRef.current = msgId;
            firstChunkRef.current = true;
            setIsTyping(false);
            setStreamingMsgId(msgId);
            setMessages((prev) => [
              ...prev,
              {
                id: msgId,
                role: "assistant",
                content: "",
                ts: new Date().toISOString(),
                traceSteps: [step],
              },
            ]);
            return;
          }
          const msgId = streamingMsgIdRef.current;
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== msgId) return m;
              const steps = m.traceSteps ? [...m.traceSteps] : [];

              // tool_end 事件：通过 parent_step_id 找到对应的 tool_call 节点并标记完成
              if (step.type === "tool_end" && step.parent_step_id) {
                const parentIdx = steps.findIndex(
                  (s) => s.step_id === step.parent_step_id,
                );
                if (parentIdx >= 0) {
                  steps[parentIdx] = {
                    ...steps[parentIdx],
                    status: step.status,
                  };
                }
                return { ...m, traceSteps: steps };
              }

              const idx = steps.findIndex((s) => s.step_id === step.step_id);
              if (idx >= 0) {
                // thinking/running 既可能是增量，也可能是当前完整快照，需智能合并。
                if (step.type === "thinking" && step.status === "running") {
                  const previousThinking = steps[idx].thinking ?? "";
                  steps[idx] = {
                    ...steps[idx],
                    ...step,
                    thinking: mergeStreamingText(
                      previousThinking,
                      step.thinking ?? "",
                    ),
                  };
                } else {
                  steps[idx] = step;
                }
              } else {
                steps.push(step);
              }
              return { ...m, traceSteps: steps };
            }),
          );
        },
        onTraceDone: () => {},
        onConversationTitle: (conversationId, title) => {
          setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, title } : c)),
          );
        },
        onDone: () => {
          setIsTyping(false);
          setStreamingMsgId(null);
          streamingMsgIdRef.current = null;
          runIdRef.current = null;
        },
        onError: (detail) => {
          console.error("streamChat error:", detail);
          setIsTyping(false);
          setStreamingMsgId(null);
          streamingMsgIdRef.current = null;
          runIdRef.current = null;
        },
      }).catch((e) => {
        console.error(e);
        setIsTyping(false);
        setStreamingMsgId(null);
        streamingMsgIdRef.current = null;
        runIdRef.current = null;
      });
    },
    [activeId, navigate, thinkingEnabled],
  );

  const handleStop = useCallback(() => {
    const runId = runIdRef.current;
    if (!runId) return;
    stopChatRun(runId).catch(console.error);
  }, []);

  const handleNewChat = useCallback(() => {
    navigate("/new");
  }, [navigate]);

  useEffect(() => {
    if (autoSentRef.current || urlId) return;
    const state = location.state as {
      initialMessage?: string;
      thinkingEnabled?: boolean;
      searchEnabled?: boolean;
    } | null;
    if (!state?.initialMessage) return;
    autoSentRef.current = true;
    const msg = state.initialMessage;
    const enableThinking = state.thinkingEnabled ?? false;
    navigate(location.pathname, { replace: true, state: null });
    setTimeout(() => {
      if (enableThinking) setThinkingEnabled(true);
      handleSend(msg);
    }, 0);
  }, [
    handleSend,
    location.pathname,
    location.state,
    navigate,
    setThinkingEnabled,
    urlId,
  ]);

  const handleSelect = useCallback(
    (id: string) => {
      navigate(`/chat/${id}`);
    },
    [navigate],
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        let nextConvId: string | null = null;
        setConversations((prev) => {
          const next = prev.filter((c) => c.id !== id);
          if (activeId === id) {
            nextConvId = next[0]?.id ?? null;
          }
          return next;
        });
        if (activeId === id) {
          if (nextConvId) {
            navigate(`/chat/${nextConvId}`);
          } else {
            navigate("/chat");
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    [activeId, navigate],
  );

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

  const handleRetryMessage = useCallback(
    (msgId: string) => {
      const idx = messages.findIndex((m) => m.id === msgId);
      if (idx === -1) return;
      const msg = messages[idx];

      let userContent: string;
      let cutIdx: number;

      if (msg.role === "user") {
        userContent = msg.content;
        cutIdx = idx;
      } else {
        let userIdx = idx - 1;
        while (userIdx >= 0 && messages[userIdx].role !== "user") userIdx--;
        if (userIdx < 0) return;
        userContent = messages[userIdx].content;
        cutIdx = userIdx;
      }

      setMessages((prev) => prev.slice(0, cutIdx));
      handleSend(userContent);
    },
    [messages, handleSend],
  );

  const handleEditMessage = useCallback(
    (msgId: string, newContent: string) => {
      const idx = messages.findIndex((m) => m.id === msgId);
      if (idx === -1) return;
      setMessages((prev) => prev.slice(0, idx));
      handleSend(newContent);
    },
    [messages, handleSend],
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
        activeId={activeId ?? ""}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
      <main
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        style={{ background: "var(--base-bg)" }}
      >
        <ChatHeader
          title={activeConv?.title ?? "新聊天"}
          onRename={(title) =>
            activeId && handleRenameConversation(activeId, title)
          }
          onDelete={() => activeId && handleDeleteConversation(activeId)}
          thinkingEnabled={thinkingEnabled}
        />
        <MessageList
          messages={messages}
          isTyping={isTyping}
          streamingMsgId={streamingMsgId}
          isBusy={isBusy}
          onRetry={handleRetryMessage}
          onEdit={handleEditMessage}
        />
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          disabled={isBusy}
          thinkingEnabled={thinkingEnabled}
          onThinkingToggle={toggleThinking}
          searchEnabled={searchEnabled}
          onSearchToggle={toggleSearch}
        />
      </main>
    </div>
  );
}
