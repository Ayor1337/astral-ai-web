import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  Message,
  TraceStep,
  ThoughtStep,
  SearchResultItem,
  FetchCardPayload,
  RetryCardPayload,
  ToolCardPayload,
} from "@/types/types";

// ── ThoughtStep renderer ─────────────────────────────

function ThoughtStepItem({ step }: { step: ThoughtStep | TraceStep }) {
  return (
    <div className={`thought-step thought-step--${step.status}`}>
      <div className="thought-step-icon">
        {step.status === "running" ? (
          <span className="trace-spinner" />
        ) : step.status === "success" ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span className="trace-status-dot" />
        )}
      </div>
      <div className="thought-step-body">
        {step.message && (
          <span className="thought-step-message">{step.message}</span>
        )}
      </div>
    </div>
  );
}

// ── Trace tree helpers ───────────────────────────────

interface TraceNode {
  step: TraceStep;
  children: TraceNode[];
}

function buildTraceTree(steps: TraceStep[]): TraceNode[] {
  const sorted = [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const nodeMap = new Map<string, TraceNode>();
  for (const step of sorted) nodeMap.set(step.step_id, { step, children: [] });
  const roots: TraceNode[] = [];
  for (const step of sorted) {
    const node = nodeMap.get(step.step_id)!;
    if (step.parent_step_id) {
      const parent = nodeMap.get(step.parent_step_id);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }
    roots.push(node);
  }
  return roots;
}

interface Props {
  message: Message;
  isStreaming?: boolean;
  isLatestUserMsg?: boolean;
  isBusy?: boolean;
  onRetry?: (msgId: string) => void;
  onEdit?: (msgId: string, newContent: string) => void;
}

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      className="msg-action-btn"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? (
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
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
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function RetryBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="msg-action-btn" onClick={onClick} title="Retry">
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
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
      </svg>
    </button>
  );
}

// ── Payload card renderers ───────────────────────────

function SearchPayloadCard({ items }: { items: SearchResultItem[] }) {
  if (!items.length) return null;
  return (
    <div className="trace-payload-search">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.url}
          className="trace-search-item"
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="trace-search-domain">{item.domain}</span>
          <span className="trace-search-title">{item.title}</span>
          {item.snippet && (
            <span className="trace-search-snippet">{item.snippet}</span>
          )}
        </a>
      ))}
    </div>
  );
}

function TracePayloadCard({ step }: { step: TraceStep }) {
  if (!step.payload) return null;

  if (step.type === "search") {
    const items = (step.payload.items as SearchResultItem[] | undefined) ?? [];
    return <SearchPayloadCard items={items} />;
  }

  if (step.type === "fetch") {
    const p = step.payload as unknown as FetchCardPayload;
    return (
      <div className="trace-payload-fetch">
        {p.url && <span className="trace-fetch-url">{p.url}</span>}
        {p.http_status != null && (
          <span className="trace-fetch-status">HTTP {p.http_status}</span>
        )}
        {p.error_message && (
          <span className="trace-fetch-error">{p.error_message}</span>
        )}
      </div>
    );
  }

  if (step.type === "retry") {
    const p = step.payload as unknown as RetryCardPayload;
    return p.reason ? (
      <div className="trace-payload-retry">
        <span className="trace-retry-reason">{p.reason}</span>
      </div>
    ) : null;
  }

  if (step.type === "tool_call" || step.type === "tool_result") {
    const p = step.payload as unknown as ToolCardPayload;
    return (
      <div className="trace-payload-tool">
        {p.tool_name && <span className="trace-tool-name">{p.tool_name}</span>}
        {p.input != null && (
          <pre className="trace-tool-json">
            {JSON.stringify(p.input, null, 2)}
          </pre>
        )}
        {p.output != null && (
          <pre className="trace-tool-json">
            {JSON.stringify(p.output, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  return null;
}

// ── Trace step type icons ────────────────────────────

function TraceStatusIcon({ status }: { status: TraceStep["status"] }) {
  if (status === "running") return <span className="trace-spinner" />;
  if (status === "success")
    return (
      <svg
        className="trace-status-icon trace-status-success"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  if (status === "error")
    return (
      <svg
        className="trace-status-icon trace-status-error"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  // pending / skipped
  return <span className="trace-status-dot" />;
}

function TraceStepItem({
  node,
  depth = 0,
}: {
  node: TraceNode;
  depth?: number;
}) {
  const { step, children } = node;
  return (
    <>
      <div
        className={`trace-step trace-step--${step.status}`}
        style={depth > 0 ? { marginLeft: `${depth * 16}px` } : undefined}
      >
        <div className="trace-step-icon">
          <TraceStatusIcon status={step.status} />
        </div>
        <div className="trace-step-content">
          <div className="trace-step-header">
            <span className="trace-step-title">{step.title}</span>
            {step.duration_ms != null && (
              <span className="trace-step-duration">
                {step.duration_ms >= 1000
                  ? `${(step.duration_ms / 1000).toFixed(1)}s`
                  : `${step.duration_ms}ms`}
              </span>
            )}
          </div>
          {step.message && (
            <div className="trace-step-message">{step.message}</div>
          )}
          {step.error_message && (
            <div className="trace-step-error">{step.error_message}</div>
          )}
          <TracePayloadCard step={step} />
        </div>
      </div>
      {children.map((child) => (
        <TraceStepItem
          key={child.step.step_id}
          node={child}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

export default function MessageBubble({
  message,
  isStreaming,
  isLatestUserMsg,
  isBusy,
  onRetry,
  onEdit,
}: Props) {
  const isUser = message.role === "user";
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);

  // 思考步骤：优先用 thoughtSteps（thought_step 事件），回退到 trace_steps 中的 type=thought
  const thoughtDisplaySteps: (ThoughtStep | TraceStep)[] = message.thoughtSteps
    ?.length
    ? message.thoughtSteps
    : (message.traceSteps?.filter((s) => s.type === "thought") ?? []);

  // 执行轨迹：只显示非 thought 类型的 trace_step
  const traceDisplaySteps =
    message.traceSteps?.filter((s) => s.type !== "thought") ?? [];

  const hasThoughtPanel =
    thoughtDisplaySteps.length > 0 || traceDisplaySteps.length > 0;
  const isThinking = thoughtDisplaySteps.some((s) => s.status === "running");

  // 旧字段兼容：若没有 thoughtDisplaySteps 且存在 legacy reasoning
  const hasLegacyReasoning = !thoughtDisplaySteps.length && !!message.reasoning;
  const isLegacyReasoningStreaming =
    hasLegacyReasoning && message.reasoningStatus === "streaming";

  const [reasoningExpanded, setReasoningExpanded] = useState(
    isThinking || isLegacyReasoningStreaming,
  );

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

  if (isUser) {
    return (
      <div className="msg-row msg-row-user">
        {editing ? (
          <div className="msg-edit-wrapper">
            <textarea
              className="msg-edit-textarea"
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
            <div className="msg-edit-actions">
              <button className="msg-edit-save" onClick={handleEditSave}>
                Send
              </button>
              <button className="msg-edit-cancel" onClick={handleEditCancel}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="msg-user-bubble">{message.content}</div>
        )}
        {!editing && (
          <div className="msg-actions msg-actions-user">
            <span className="msg-action-time">{formatTime(message.ts)}</span>
            {!isBusy && onRetry && (
              <RetryBtn onClick={() => onRetry(message.id)} />
            )}
            {!isBusy && isLatestUserMsg && onEdit && (
              <button
                className="msg-action-btn"
                onClick={() => setEditing(true)}
                title="Edit"
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
            <CopyBtn text={message.content} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="msg-row msg-row-ai">
      {/* Reasoning / thought-step panel */}
      {(hasThoughtPanel || hasLegacyReasoning) && (
        <div className="reasoning-panel">
          <button
            className="reasoning-header"
            onClick={() => setReasoningExpanded((v) => !v)}
            aria-expanded={
              reasoningExpanded || isThinking || isLegacyReasoningStreaming
            }
          >
            <span className="reasoning-summary">
              {isThinking || isLegacyReasoningStreaming
                ? "思考中…"
                : "思考过程"}
            </span>
            <svg
              className="reasoning-chevron"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform:
                  reasoningExpanded || isThinking || isLegacyReasoningStreaming
                    ? "rotate(180deg)"
                    : "none",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div
            className={`reasoning-body-outer${
              reasoningExpanded || isThinking || isLegacyReasoningStreaming
                ? ""
                : " reasoning-body-outer--hidden"
            }`}
          >
            <div className="reasoning-body">
              {/* 思考步骤区 */}
              {thoughtDisplaySteps.length > 0 && (
                <div className="thought-steps">
                  {[...thoughtDisplaySteps]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((s) => (
                      <ThoughtStepItem key={s.step_id} step={s} />
                    ))}
                  {/* Done 行作为链条最后一节 */}
                  {!isThinking && !isLegacyReasoningStreaming && (
                    <div className="thought-step thought-step--done">
                      <div className="thought-step-icon">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div className="thought-step-body">
                        <span className="thought-step-message">完成</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 执行轨迹区（非 thought 类型） */}
              {traceDisplaySteps.length > 0 && (
                <div className="trace-timeline">
                  {buildTraceTree(traceDisplaySteps).map((node) => (
                    <TraceStepItem key={node.step.step_id} node={node} />
                  ))}
                </div>
              )}

              {/* Legacy reasoning 文本（旧格式回退） */}
              {hasLegacyReasoning && (
                <div className="reasoning-step">
                  <span className="reasoning-step-icon reasoning-step-icon--thinking" />
                  <span className="reasoning-step-text">
                    {message.reasoning}
                    {isLegacyReasoningStreaming && (
                      <span className="msg-cursor" aria-hidden="true" />
                    )}
                  </span>
                </div>
              )}

              {!isThinking &&
                !isLegacyReasoningStreaming &&
                !thoughtDisplaySteps.length && (
                  <div className="reasoning-step reasoning-step--done">
                    <svg
                      className="reasoning-step-icon--done"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="reasoning-step-text">Done</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <div className="msg-ai-text msg-ai-markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
      {!isStreaming && (
        <div className="msg-actions msg-actions-ai">
          <CopyBtn text={message.content} />
          {!isBusy && onRetry && (
            <RetryBtn onClick={() => onRetry(message.id)} />
          )}
        </div>
      )}
    </div>
  );
}
