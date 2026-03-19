import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import type {
  Message,
  Conversation,
  MessageAPI,
  TraceStep,
  ThoughtStep,
} from "@/types/types";
import {
  getConversations,
  getConversationDetail,
  updateConversationTitle,
  deleteConversation,
  streamChat,
  stopChatRun,
} from "@/services/api";
import ChatSidebar from "./components/ChatSidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

export default function ChatView() {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(urlId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [thinkingEnabled, setThinkingEnabled] = useState(false);

  // Refs to track streaming state without stale closures
  const firstChunkRef = useRef(false);
  const streamingMsgIdRef = useRef<string | null>(null);
  const reasoningBufferRef = useRef("");
  const runIdRef = useRef<string | null>(null);
  // skipUrlLoadRef: set to true before navigating during streaming to avoid
  // re-loading messages from the server when the URL changes mid-stream
  const skipUrlLoadRef = useRef(false);
  const activeIdRef = useRef<string | null>(urlId ?? null);
  // autoSentRef: prevents double-firing the initial message from /new
  const autoSentRef = useRef(false);
  // isFirstRoundRef: true when the current round is the first message of the conversation
  // (title is generated async on backend and must be fetched after done)
  const isFirstRoundRef = useRef(false);
  // streamingConvIdRef: conversation id confirmed by the SSE conversation event
  const streamingConvIdRef = useRef<string | null>(null);

  /** Map API messages to frontend Message shape */
  const mapAPIMessages = useCallback(
    (convId: string, msgs: MessageAPI[]): Message[] =>
      msgs.map((m) => ({
        id: `${convId}-${m.sequence}`,
        role: m.role,
        content: m.content,
        reasoning: m.reasoning_summary ?? undefined,
        reasoningStatus: m.reasoning_summary != null ? "completed" : undefined,
        traceSteps: m.trace_steps ?? undefined,
        ts: m.created_at,
      })),
    [],
  );

  // Keep activeIdRef in sync for use inside streaming callbacks
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Load conversation list once on mount; if no id in URL, redirect to first conversation
  useEffect(() => {
    getConversations()
      .then((list) => {
        const convs = list.map((c) => ({ id: c.id, title: c.title }));
        setConversations(convs);
        // Skip redirect if we came from /new with an initial message to send
        if (!urlId && convs.length > 0 && !autoSentRef.current) {
          navigate(`/chat/${convs[0].id}`, { replace: true });
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages whenever the URL conversation id changes
  useEffect(() => {
    if (!urlId) {
      setActiveId(null);
      setMessages([]);
      return;
    }
    // Navigation was triggered internally (e.g. during streaming) — skip server fetch
    if (skipUrlLoadRef.current) {
      skipUrlLoadRef.current = false;
      setActiveId(urlId);
      return;
    }
    setActiveId(urlId);
    setMessages([]);
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
      reasoningBufferRef.current = "";
      streamingConvIdRef.current = null;
      // First round = no assistant messages exist yet in this conversation
      isFirstRoundRef.current = !messages.some((m) => m.role === "assistant");

      streamChat(activeId, content, thinkingEnabled, {
        onConversation: (conversationId, title, runId) => {
          runIdRef.current = runId;
          streamingConvIdRef.current = conversationId;
          // If this is a brand-new conversation (activeId was null), navigate to its URL
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
        onReasoningChunk: (content) => {
          const msgId = streamingMsgIdRef.current;
          if (!msgId) return;
          reasoningBufferRef.current += content;
          const text = reasoningBufferRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, reasoning: text, reasoningStatus: "streaming" }
                : m,
            ),
          );
        },
        onReasoningDone: (summary, status) => {
          const msgId = streamingMsgIdRef.current;
          if (!msgId) return;
          const finalText = summary || reasoningBufferRef.current;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    reasoning: finalText,
                    reasoningStatus:
                      status === "completed" ? "completed" : "failed",
                  }
                : m,
            ),
          );
        },
        onThoughtStep: (step: ThoughtStep) => {
          // thought_step 优先于 chunk 到达，若气泡未创建则创建空气泡
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
                thoughtSteps: [step],
              },
            ]);
            return;
          }
          const msgId = streamingMsgIdRef.current;
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== msgId) return m;
              const steps = m.thoughtSteps ? [...m.thoughtSteps] : [];
              const idx = steps.findIndex((s) => s.step_id === step.step_id);
              if (idx >= 0) steps[idx] = step;
              else steps.push(step);
              return { ...m, thoughtSteps: steps };
            }),
          );
        },
        onTraceStep: (step: TraceStep) => {
          // trace_step 可能先于首个 chunk 到达（complex/thinking 路径）
          // 若消息气泡还未创建，立即创建一个空内容的 assistant 气泡
          if (!streamingMsgIdRef.current) {
            const msgId = `ai-${Date.now()}`;
            streamingMsgIdRef.current = msgId;
            firstChunkRef.current = true; // 防止 onChunk 再次创建气泡
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
              const idx = steps.findIndex((s) => s.step_id === step.step_id);
              if (idx >= 0) steps[idx] = step;
              else steps.push(step);
              return { ...m, traceSteps: steps };
            }),
          );
        },
        onTraceDone: () => {
          // Trace complete — no special handling needed
        },
        onDone: () => {
          setIsTyping(false);
          setStreamingMsgId(null);
          streamingMsgIdRef.current = null;
          reasoningBufferRef.current = "";
          runIdRef.current = null;
          // After the first round, the backend generates the title asynchronously.
          // Fetch the updated title once it's ready.
          if (isFirstRoundRef.current && streamingConvIdRef.current) {
            const convId = streamingConvIdRef.current;
            isFirstRoundRef.current = false;
            setTimeout(() => {
              getConversationDetail(convId)
                .then((detail) => {
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === detail.id ? { ...c, title: detail.title } : c,
                    ),
                  );
                })
                .catch(console.error);
            }, 1500);
          }
        },
        onError: (detail) => {
          console.error("streamChat error:", detail);
          setIsTyping(false);
          setStreamingMsgId(null);
          streamingMsgIdRef.current = null;
          reasoningBufferRef.current = "";
          runIdRef.current = null;
          isFirstRoundRef.current = false;
        },
      }).catch((e) => {
        console.error(e);
        setIsTyping(false);
        setStreamingMsgId(null);
        streamingMsgIdRef.current = null;
        reasoningBufferRef.current = "";
        runIdRef.current = null;
      });
    },
    [activeId, messages, navigate, thinkingEnabled],
  );

  const handleStop = useCallback(() => {
    const runId = runIdRef.current;
    if (!runId) return;
    stopChatRun(runId).catch(console.error);
  }, []);

  const handleNewChat = useCallback(() => {
    navigate("/new");
  }, [navigate]);

  // Auto-send initial message when navigated from /new page
  useEffect(() => {
    if (autoSentRef.current || urlId) return;
    const state = location.state as {
      initialMessage?: string;
      thinkingEnabled?: boolean;
    } | null;
    if (!state?.initialMessage) return;
    autoSentRef.current = true;
    const msg = state.initialMessage;
    const enableThinking = state.thinkingEnabled ?? false;
    // Clear navigation state so back-navigation doesn't re-trigger
    navigate(location.pathname, { replace: true, state: null });
    if (enableThinking) setThinkingEnabled(true);
    // Defer one tick so state flush completes
    setTimeout(() => handleSend(msg), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Find the closest preceding user message
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

  return (
    <div className="chat-page">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId ?? ""}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
      <main className="chat-main">
        <ChatHeader
          title={activeConv?.title ?? ""}
          onRename={(title) =>
            activeId && handleRenameConversation(activeId, title)
          }
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
          onThinkingToggle={() => setThinkingEnabled((v) => !v)}
        />
      </main>
    </div>
  );
}
