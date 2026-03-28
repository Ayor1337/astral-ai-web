import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/types/types";
import { CopyButton, RetryButton } from "./MessageBubbleActions";
import ReasoningPanel from "./reasoning/ReasoningPanel";
import { markdownClass } from "./messageBubble.utils";

interface Props {
  message: Message;
  isStreaming?: boolean;
  isBusy?: boolean;
  onRetry?: (msgId: string) => void;
}

export default function AssistantMessageBubble({
  message,
  isStreaming,
  isBusy,
  onRetry,
}: Props) {
  return (
    <div className="group/message flex flex-col items-start gap-1">
      <ReasoningPanel traceSteps={message.traceSteps} />

      <div className={markdownClass}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>

      {!isStreaming && (
        <div className="mt-1 flex items-center justify-start gap-0.5 opacity-0 transition-opacity duration-150 group-hover/message:opacity-100">
          <CopyButton text={message.content} />
          {!isBusy && onRetry && (
            <RetryButton onClick={() => onRetry(message.id)} />
          )}
        </div>
      )}
    </div>
  );
}
