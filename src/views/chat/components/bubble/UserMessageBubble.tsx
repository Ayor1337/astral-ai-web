import { useState } from "react";
import type { Message } from "@/types/types";
import { CopyButton, RetryButton } from "./MessageBubbleActions";
import { formatTime, iconButtonClass } from "./messageBubble.utils";

interface Props {
  message: Message;
  isLatestUserMsg?: boolean;
  isBusy?: boolean;
  onRetry?: (msgId: string) => void;
  onEdit?: (msgId: string, newContent: string) => void;
}

export default function UserMessageBubble({
  message,
  isLatestUserMsg,
  isBusy,
  onRetry,
  onEdit,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  const handleEditSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(message.content);
    setEditing(false);
  };

  return (
    <div className="group/message flex flex-col items-end gap-1">
      {editing ? (
        <div className="w-full max-w-[80%] self-end">
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full rounded-xl border border-(--surface-border) bg-(--surface-bg2) px-3.5 py-2.5 text-[0.9375rem] leading-[1.55] text-(--text-base) outline-none transition-colors duration-150 focus:border-(--highlight)"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSave();
                }
                if (e.key === "Escape") handleEditCancel();
              }}
              autoFocus
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg bg-(--highlight) px-4 py-1.5 text-[0.875rem] font-medium text-white transition-colors duration-100 hover:bg-(--highlight-strong)"
                onClick={handleEditSave}
                type="button"
              >
                Send
              </button>
              <button
                className="rounded-lg bg-[rgba(255,255,255,0.07)] px-4 py-1.5 text-[0.875rem] font-medium text-(--text-muted) transition-colors duration-100 hover:bg-[rgba(255,255,255,0.12)]"
                onClick={handleEditCancel}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[80%] whitespace-pre-wrap wrap-break-word rounded-[20px] bg-(--msg-user-bg) px-4 py-2.5 text-[0.9375rem] leading-[1.55] text-(--msg-user-text)">
          {message.content}
        </div>
      )}
      {!editing && (
        <div className="mt-1 flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-150 group-hover/message:opacity-100">
          <span className="mr-1 select-none text-xs text-(--text-subtle)">
            {formatTime(message.ts)}
          </span>
          {!isBusy && onRetry && (
            <RetryButton onClick={() => onRetry(message.id)} />
          )}
          {!isBusy && isLatestUserMsg && onEdit && (
            <button
              className={iconButtonClass}
              onClick={() => setEditing(true)}
              title="Edit"
              type="button"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <CopyButton text={message.content} />
        </div>
      )}
    </div>
  );
}
