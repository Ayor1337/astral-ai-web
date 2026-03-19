import { useMemo, useState } from "react";
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

const iconButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-[7px] bg-transparent text-(--text-subtle) transition-[background,color] duration-100 hover:bg-[rgba(255,255,255,0.08)] hover:text-(--text-base)";

function Spinner({ subtle = false }: { subtle?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border-solid animate-spin ${subtle ? "border-[1.5px] border-[color-mix(in_srgb,var(--text-muted)_25%,transparent)] border-t-(--text-muted)" : "border-[1.5px] border-(--text-subtle) border-t-(--accent)"}`}
      style={{ width: subtle ? 14 : 12, height: subtle ? 14 : 12 }}
    />
  );
}

function ThoughtStepItem({
  step,
  isLast,
}: {
  step: ThoughtStep | TraceStep;
  isLast: boolean;
}) {
  const isSuccess = step.status === "success";
  const isRunning = step.status === "running";

  return (
    <div className="relative flex items-start gap-1.5 py-1">
      {!isLast && (
        <span className="absolute left-1.75 top-5.25 bottom-0 w-[1.5px] rounded-full bg-(--text-muted) opacity-25" />
      )}
      <div className="mt-px flex h-4 w-4 shrink-0 items-center justify-center text-(--text-muted)">
        {isRunning ? (
          <Spinner subtle />
        ) : isSuccess ? (
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
          <span className="h-1.5 w-1.5 rounded-full bg-(--text-muted) opacity-50" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        {step.message && (
          <span className="text-[11px] leading-[1.4] text-(--text-muted)">
            {step.message}
          </span>
        )}
      </div>
    </div>
  );
}

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
      className={iconButtonClass}
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      type="button"
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
    <button
      className={iconButtonClass}
      onClick={onClick}
      title="Retry"
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
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
      </svg>
    </button>
  );
}

function SearchPayloadCard({ items }: { items: SearchResultItem[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-col gap-1 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 transition-colors duration-100 hover:bg-(--surface-active)"
        >
          <span className="text-[11px] uppercase tracking-[0.08em] text-(--text-subtle)">
            {item.domain}
          </span>
          <span className="text-[0.8125rem] font-medium text-(--text-base)">
            {item.title}
          </span>
          {item.snippet && (
            <span className="text-[0.75rem] leading-[1.45] text-(--text-muted)">
              {item.snippet}
            </span>
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
      <div className="mt-2 flex flex-col gap-1 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 text-[0.75rem] text-(--text-muted)">
        {p.url && <span className="break-all">{p.url}</span>}
        {p.http_status != null && <span>HTTP {p.http_status}</span>}
        {p.error_message && (
          <span className="text-[#ef4444]">{p.error_message}</span>
        )}
      </div>
    );
  }

  if (step.type === "retry") {
    const p = step.payload as unknown as RetryCardPayload;
    return p.reason ? (
      <div className="mt-2 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 text-[0.75rem] text-(--text-muted)">
        {p.reason}
      </div>
    ) : null;
  }

  if (step.type === "tool_call" || step.type === "tool_result") {
    const p = step.payload as unknown as ToolCardPayload;
    return (
      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2">
        {p.tool_name && (
          <span className="text-[0.8125rem] font-medium text-(--text-base)">
            {p.tool_name}
          </span>
        )}
        {p.input != null && (
          <pre className="overflow-x-auto rounded-lg border border-(--surface-border) bg-[rgba(10,8,5,0.55)] p-3 text-[0.75rem] leading-[1.45] text-(--text-base)">
            {JSON.stringify(p.input, null, 2)}
          </pre>
        )}
        {p.output != null && (
          <pre className="overflow-x-auto rounded-lg border border-(--surface-border) bg-[rgba(10,8,5,0.55)] p-3 text-[0.75rem] leading-[1.45] text-(--text-base)">
            {JSON.stringify(p.output, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  return null;
}

function TraceStatusIcon({ status }: { status: TraceStep["status"] }) {
  if (status === "running") return <Spinner />;
  if (status === "success") {
    return (
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#22c55e]"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#ef4444]"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return <span className="h-1.5 w-1.5 rounded-full bg-(--text-subtle)" />;
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
        className="flex items-start gap-1.5 py-0.75"
        style={depth > 0 ? { marginLeft: `${depth * 16}px` } : undefined}
      >
        <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          <TraceStatusIcon status={step.status} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.25 text-[0.8125rem] text-(--text-muted)">
            <span
              className={
                step.status === "error"
                  ? "text-[#ef4444]"
                  : "text-(--text-muted)"
              }
            >
              {step.title}
            </span>
            {step.duration_ms != null && (
              <span className="ml-auto shrink-0 text-[0.6875rem] text-(--text-subtle)">
                {step.duration_ms >= 1000
                  ? `${(step.duration_ms / 1000).toFixed(1)}s`
                  : `${step.duration_ms}ms`}
              </span>
            )}
          </div>
          {step.message && (
            <div className="mt-px text-[0.75rem] leading-[1.4] text-(--text-subtle)">
              {step.message}
            </div>
          )}
          {step.error_message && (
            <div className="mt-px text-[0.75rem] leading-[1.4] text-[#ef4444]">
              {step.error_message}
            </div>
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

const markdownClass =
  "max-w-full wrap-break-word text-[0.9375rem] leading-[1.7] text-(--text-base) [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:mb-[0.45em] [&_h1]:mt-[1.1em] [&_h1]:text-[1.35em] [&_h1]:font-semibold [&_h1]:leading-[1.35] [&_h1]:text-(--heading) [&_h2]:mb-[0.45em] [&_h2]:mt-[1.1em] [&_h2]:text-[1.2em] [&_h2]:font-semibold [&_h2]:leading-[1.35] [&_h2]:text-(--heading) [&_h3]:mb-[0.45em] [&_h3]:mt-[1.1em] [&_h3]:text-[1.08em] [&_h3]:font-semibold [&_h3]:leading-[1.35] [&_h3]:text-(--heading) [&_h4]:mb-[0.45em] [&_h4]:mt-[1.1em] [&_h4]:text-[1em] [&_h4]:font-semibold [&_h4]:leading-[1.35] [&_h4]:text-(--heading) [&_h5]:mb-[0.45em] [&_h5]:mt-[1.1em] [&_h5]:text-[1em] [&_h5]:font-semibold [&_h5]:leading-[1.35] [&_h5]:text-(--heading) [&_h6]:mb-[0.45em] [&_h6]:mt-[1.1em] [&_h6]:text-[1em] [&_h6]:font-semibold [&_h6]:leading-[1.35] [&_h6]:text-(--heading) [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-[0.2em] [&_blockquote]:my-3 [&_blockquote]:rounded-r bg-transparent [&_blockquote]:bg-[rgba(218,119,86,0.06)] [&_blockquote]:px-3.5 [&_blockquote]:py-1 [&_blockquote]:text-(--text-muted) [&_blockquote]:border-l-[3px] [&_blockquote]:border-(--highlight) [&_code]:rounded [&_code]:bg-[rgba(255,255,255,0.07)] [&_code]:px-1.5 [&_code]:py-[0.15em] [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-(--highlight) [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-(--surface-border) [&_pre]:bg-[rgba(10,8,5,0.55)] [&_pre]:px-4 [&_pre]:py-3.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.875em] [&_pre_code]:text-(--text-base) [&_hr]:my-4 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-(--divider) [&_a]:text-(--highlight) [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-(--highlight-strong) [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.9em] [&_th]:border [&_th]:border-(--surface-border) [&_th]:bg-[rgba(255,255,255,0.05)] [&_th]:px-3 [&_th]:py-[0.4em] [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-(--surface-border) [&_td]:px-3 [&_td]:py-[0.4em] [&_td]:text-left [&_tr:nth-child(even)_td]:bg-[rgba(255,255,255,0.025)] [&_strong]:font-bold [&_em]:italic [&_del]:text-(--text-subtle) [&_del]:line-through";

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

  const thoughtDisplaySteps = useMemo<(ThoughtStep | TraceStep)[]>(
    () =>
      message.thoughtSteps?.length
        ? message.thoughtSteps
        : (message.traceSteps?.filter((s) => s.type === "thought") ?? []),
    [message.thoughtSteps, message.traceSteps],
  );

  const traceDisplaySteps =
    message.traceSteps?.filter((s) => s.type !== "thought") ?? [];

  const hasThoughtPanel =
    thoughtDisplaySteps.length > 0 || traceDisplaySteps.length > 0;
  const isThinking = thoughtDisplaySteps.some((s) => s.status === "running");

  const hasLegacyReasoning = !thoughtDisplaySteps.length && !!message.reasoning;
  const isLegacyReasoningStreaming =
    hasLegacyReasoning && message.reasoningStatus === "streaming";

  const [reasoningExpanded, setReasoningExpanded] = useState(
    isThinking || isLegacyReasoningStreaming,
  );

  const orderedThoughtSteps = useMemo(
    () =>
      [...thoughtDisplaySteps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [thoughtDisplaySteps],
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
              <RetryBtn onClick={() => onRetry(message.id)} />
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
            <CopyBtn text={message.content} />
          </div>
        )}
      </div>
    );
  }

  const thoughtRows = [...orderedThoughtSteps];
  if (!isThinking && !isLegacyReasoningStreaming && thoughtRows.length > 0) {
    thoughtRows.push({
      step_id: "done",
      status: "success",
      type: "thought",
      title: "done",
      message: "完成",
      order: (thoughtRows.at(-1)?.order ?? 0) + 1,
    } as ThoughtStep);
  }

  return (
    <div className="group/message flex flex-col items-start gap-1">
      {(hasThoughtPanel || hasLegacyReasoning) && (
        <div className="mb-2.5">
          <button
            className="inline-flex items-center gap-1 bg-transparent p-0 text-[0.8125rem] text-(--text-muted) transition-colors duration-100 hover:text-(--text-primary)"
            onClick={() => setReasoningExpanded((v) => !v)}
            aria-expanded={
              reasoningExpanded || isThinking || isLegacyReasoningStreaming
            }
            type="button"
          >
            <span className="max-w-105 overflow-hidden text-ellipsis whitespace-nowrap font-normal">
              {isThinking || isLegacyReasoningStreaming
                ? "思考中…"
                : "思考过程"}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`shrink-0 opacity-60 transition-transform duration-200 ${reasoningExpanded || isThinking || isLegacyReasoningStreaming ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-200"
            style={{
              gridTemplateRows:
                reasoningExpanded || isThinking || isLegacyReasoningStreaming
                  ? "1fr"
                  : "0fr",
            }}
          >
            <div className="min-h-0 overflow-hidden pl-1 pt-1.5">
              {thoughtRows.length > 0 && (
                <div className="mb-1.5 flex flex-col gap-0 border-b border-(--border) pb-1">
                  {thoughtRows.map((step, index) => (
                    <ThoughtStepItem
                      key={`${step.step_id}-${index}`}
                      step={step}
                      isLast={index === thoughtRows.length - 1}
                    />
                  ))}
                </div>
              )}

              {traceDisplaySteps.length > 0 && (
                <div className="flex flex-col gap-0 pt-0.5">
                  {buildTraceTree(traceDisplaySteps).map((node) => (
                    <TraceStepItem key={node.step.step_id} node={node} />
                  ))}
                </div>
              )}

              {hasLegacyReasoning && (
                <div className="flex items-start gap-1.5 py-0.75 text-[0.8125rem] leading-normal text-(--text-muted)">
                  <span className="mt-0.5">
                    <Spinner subtle />
                  </span>
                  <span className="min-w-0 flex-1">
                    {message.reasoning}
                    {isLegacyReasoningStreaming && (
                      <span aria-hidden="true">▌</span>
                    )}
                  </span>
                </div>
              )}

              {!isThinking &&
                !isLegacyReasoningStreaming &&
                !orderedThoughtSteps.length && (
                  <div className="flex items-start gap-1.5 py-0.75 text-[0.8125rem] leading-normal text-(--text-subtle)">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-px shrink-0 text-(--text-muted)"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="min-w-0 flex-1">Done</span>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      <div className={markdownClass}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
      {!isStreaming && (
        <div className="mt-1 flex items-center justify-start gap-0.5 opacity-0 transition-opacity duration-150 group-hover/message:opacity-100">
          <CopyBtn text={message.content} />
          {!isBusy && onRetry && (
            <RetryBtn onClick={() => onRetry(message.id)} />
          )}
        </div>
      )}
    </div>
  );
}
