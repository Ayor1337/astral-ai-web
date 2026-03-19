import { useEffect, useRef, useState, useCallback } from "react";
import type { Message } from "@/types/types";
import MessageBubble from "./MessageBubble";
import TypingLogo from "./TypingLogo";

interface Props {
  messages: Message[];
  isTyping?: boolean;
  streamingMsgId?: string | null;
  isBusy?: boolean;
  onRetry?: (msgId: string) => void;
  onEdit?: (msgId: string, newContent: string) => void;
}

export default function MessageList({
  messages,
  isTyping,
  streamingMsgId,
  isBusy,
  onRetry,
  onEdit,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isIdleThinking, setIsIdleThinking] = useState(false);
  const isNearBottomRef = useRef(true);
  const idleThinkingTimeoutRef = useRef<number | null>(null);

  const latestUserMsgId = [...messages]
    .reverse()
    .find((m) => m.role === "user")?.id;

  const showThinkingAnimation =
    Boolean(isTyping) || (isIdleThinking && streamingMsgId == null);
  const showStreamingAnimation =
    !isTyping && !isIdleThinking && streamingMsgId != null;
  const typingState = showThinkingAnimation
    ? "thinking"
    : showStreamingAnimation
      ? "streaming"
      : "idle";

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
    if (isNearBottomRef.current || isTyping || streamingMsgId != null) {
      scrollToBottom();
    }
  }, [messages, isTyping, streamingMsgId, scrollToBottom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      isNearBottomRef.current = gap < 200;
      setShowScrollBtn(gap > 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (idleThinkingTimeoutRef.current != null) {
        window.clearTimeout(idleThinkingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--surface-border) [&::-webkit-scrollbar-track]:bg-transparent"
    >
      <div className="mx-auto flex max-w-180 flex-col gap-5 px-6 pb-4 pt-8">
        {messages.length === 0 && !isTyping && (
          <div className="pointer-events-none flex flex-col items-center justify-center gap-4 px-6 pb-10 pt-20 text-center select-none">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-50"
              style={{ color: "var(--text-subtle)" }}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <p className="m-0 text-[1.0625rem] font-medium text-(--text-muted)">
                开始对话
              </p>
              <p className="m-0 max-w-65 text-[0.875rem] leading-[1.6] text-(--text-subtle)">
                发送消息以开始与 Astral AI 交流
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={msg.id === streamingMsgId}
            isLatestUserMsg={msg.id === latestUserMsgId}
            isBusy={isBusy}
            onRetry={onRetry}
            onEdit={onEdit}
          />
        ))}

        <div className="flex flex-col items-start gap-1">
          <TypingLogo state={typingState} onIdleClick={handleIdleLogoClick} />
        </div>

        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          className="sticky bottom-4 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-(--scroll-btn-border) bg-(--scroll-btn-bg) text-(--text-muted) shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-[opacity,transform] duration-180 hover:opacity-80"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          type="button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
