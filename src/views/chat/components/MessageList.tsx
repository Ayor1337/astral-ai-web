import { useEffect, useRef, useState, useCallback } from "react";
import type { Message } from "@/types/types";
import MessageBubble from "./MessageBubble";
import { THINKING_LOGO_PATH, STREAMING_LOGO_PATH } from "./Idle";

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
  const showIdleLogo = !showThinkingAnimation && !showStreamingAnimation;

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

  const animationClassName = showThinkingAnimation
    ? "typing-logo typing-logo--pulse"
    : showStreamingAnimation
      ? "typing-logo typing-logo--streaming"
      : "typing-logo";
  const animationLabel = showThinkingAnimation
    ? "AI 正在思考"
    : showStreamingAnimation
      ? "AI 正在输出"
      : undefined;
  const animationLive = showIdleLogo ? undefined : "polite";
  const animationViewBox = showStreamingAnimation
    ? "0 0 100 800"
    : "0 0 100 700";
  const animationPath = showStreamingAnimation
    ? STREAMING_LOGO_PATH
    : THINKING_LOGO_PATH;

  return (
    <div ref={containerRef} className="msg-list chat-scroll">
      <div className="msg-list-inner">
        {messages.length === 0 && !isTyping && (
          <div className="chat-empty">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-subtle)", opacity: 0.5 }}
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div>
              <p className="chat-empty-title">开始对话</p>
              <p className="chat-empty-subtitle">
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

        <div className="msg-row msg-row-ai">
          {showIdleLogo ? (
            <button
              type="button"
              className="typing-logo-button"
              onClick={handleIdleLogoClick}
              aria-label="触发思考动画"
            >
              <div className={animationClassName} aria-live={animationLive}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox={animationViewBox}
                  fill="currentColor"
                >
                  <path d={animationPath} />
                </svg>
              </div>
            </button>
          ) : (
            <div
              className={animationClassName}
              aria-label={animationLabel}
              aria-live={animationLive}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={animationViewBox}
                fill="currentColor"
              >
                <path d={animationPath} />
              </svg>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          className="scroll-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
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
