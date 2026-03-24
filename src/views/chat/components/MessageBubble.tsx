import type { Message } from "@/types/types";
import AssistantMessageBubble from "./AssistantMessageBubble";
import UserMessageBubble from "./UserMessageBubble";

interface Props {
  message: Message;
  isStreaming?: boolean;
  isLatestUserMsg?: boolean;
  isBusy?: boolean;
  onRetry?: (msgId: string) => void;
  onEdit?: (msgId: string, newContent: string) => void;
}

export default function MessageBubble({
  message,
  isStreaming,
  isLatestUserMsg,
  isBusy,
  onRetry,
  onEdit,
}: Props) {
  if (message.role === "user") {
    return (
      <UserMessageBubble
        message={message}
        isLatestUserMsg={isLatestUserMsg}
        isBusy={isBusy}
        onRetry={onRetry}
        onEdit={onEdit}
      />
    );
  }

  return (
    <AssistantMessageBubble
      message={message}
      isStreaming={isStreaming}
      isBusy={isBusy}
      onRetry={onRetry}
    />
  );
}
