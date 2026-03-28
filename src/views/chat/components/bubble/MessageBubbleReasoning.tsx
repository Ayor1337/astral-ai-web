import { useMemo, useState } from "react";
import type {
  FetchCardPayload,
  RetryCardPayload,
  SearchResultItem,
  TraceStep,
} from "@/types/types";
import {
  buildTraceTree,
  type TimelineEntry,
  type TraceNode,
} from "./messageBubble.utils";
import { Spinner } from "./messageBubble.shared.tsx";

function ThoughtStepItem({
  step,
  isLast,
}: {
  step: TraceStep;
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
        {(step.thinking || step.message) && (
          <span className="text-[11px] leading-[1.4] text-(--text-muted)">
            {step.thinking || step.message}
          </span>
        )}
      </div>
    </div>
  );
}

function SearchPayloadCard({ items }: { items: SearchResultItem[] }) {
  if (!items.length) return null;

  return (
    <div className="mt-2 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 flex flex-col gap-1.5">
      {items.map((item, index) => (
        <a
          key={index}
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          className="truncate text-[0.75rem] text-(--text-muted) underline-offset-2 hover:text-(--text-base) hover:underline"
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}

function TracePayloadCard({ step }: { step: TraceStep }) {
  if (step.type === "search" && step.payload) {
    const items =
      (step.payload.results as SearchResultItem[] | undefined) ?? [];
    return <SearchPayloadCard items={items} />;
  }

  if (step.type === "fetch" && step.payload) {
    const payload = step.payload as unknown as FetchCardPayload;
    return (
      <div className="mt-2 flex flex-col gap-1 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 text-[0.75rem] text-(--text-muted)">
        {payload.url && <span className="break-all">{payload.url}</span>}
        {payload.http_status != null && <span>HTTP {payload.http_status}</span>}
        {payload.error_message && (
          <span className="text-[#ef4444]">{payload.error_message}</span>
        )}
      </div>
    );
  }

  if (step.type === "retry" && step.payload) {
    const payload = step.payload as unknown as RetryCardPayload;
    return payload.reason ? (
      <div className="mt-2 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 text-[0.75rem] text-(--text-muted)">
        {payload.reason}
      </div>
    ) : null;
  }

  if (step.type === "tool_call" || step.type === "tool_result") {
    let parsedInput: unknown = undefined;
    let parsedOutput: unknown = undefined;

    try {
      if (step.input_json) parsedInput = JSON.parse(step.input_json);
    } catch {
      // ignore malformed json from upstream
    }

    try {
      if (step.output_json) parsedOutput = JSON.parse(step.output_json);
    } catch {
      // ignore malformed json from upstream
    }

    return (
      <div className="mt-2 flex flex-col gap-2 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2">
        {step.tool_name && (
          <span className="text-[0.8125rem] font-medium text-(--text-base)">
            {step.tool_name}
          </span>
        )}
        {parsedInput != null && (
          <pre className="overflow-x-auto rounded-lg border border-(--surface-border) bg-[rgba(10,8,5,0.55)] p-3 text-[0.75rem] leading-[1.45] text-(--text-base)">
            {JSON.stringify(parsedInput, null, 2)}
          </pre>
        )}
        {parsedOutput != null && (
          <pre className="overflow-x-auto rounded-lg border border-(--surface-border) bg-[rgba(10,8,5,0.55)] p-3 text-[0.75rem] leading-[1.45] text-(--text-base)">
            {JSON.stringify(parsedOutput, null, 2)}
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
  isLast = false,
}: {
  node: TraceNode;
  depth?: number;
  isLast?: boolean;
}) {
  const { step, children } = node;

  return (
    <>
      <div
        className="relative flex items-start gap-1.5 py-0.75"
        style={depth > 0 ? { marginLeft: `${depth * 16}px` } : undefined}
      >
        {(!isLast || children.length > 0) && (
          <span className="absolute left-1.75 top-4.75 bottom-0 w-[1.5px] rounded-full bg-(--text-muted) opacity-25" />
        )}
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
              {step.type === "search"
                ? (step.query ??
                  (step.status === "running" ? "搜索中…" : "search"))
                : (step.title ?? step.tool_name ?? step.type)}
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

export default function MessageBubbleReasoning({
  traceSteps,
}: {
  traceSteps?: TraceStep[];
}) {
  const thoughtDisplaySteps = useMemo<TraceStep[]>(
    () => traceSteps?.filter((step) => step.type === "thinking") ?? [],
    [traceSteps],
  );

  const traceDisplaySteps = useMemo<TraceStep[]>(
    () =>
      traceSteps?.filter(
        (step) => step.type !== "thinking" && step.type !== "other",
      ) ?? [],
    [traceSteps],
  );

  const hasThoughtPanel =
    thoughtDisplaySteps.length > 0 || traceDisplaySteps.length > 0;
  const isThinking = thoughtDisplaySteps.some(
    (step) => step.status === "running",
  );
  const [reasoningExpanded, setReasoningExpanded] = useState(isThinking);

  const orderedThoughtSteps = useMemo(
    () =>
      [...thoughtDisplaySteps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [thoughtDisplaySteps],
  );

  const reasoningTimeline = useMemo<TimelineEntry[]>(() => {
    const entries: TimelineEntry[] = [
      ...orderedThoughtSteps.map((step) => ({
        kind: "thinking" as const,
        step,
      })),
      ...buildTraceTree(traceDisplaySteps).map((node) => ({
        kind: "trace" as const,
        node,
      })),
    ].sort((a, b) => {
      const aOrder =
        a.kind === "thinking" ? (a.step.order ?? 0) : (a.node.step.order ?? 0);
      const bOrder =
        b.kind === "thinking" ? (b.step.order ?? 0) : (b.node.step.order ?? 0);
      return aOrder - bOrder;
    });

    if (!isThinking && orderedThoughtSteps.length > 0) {
      const lastEntry = entries.at(-1);
      const lastOrder = lastEntry
        ? lastEntry.kind === "thinking"
          ? (lastEntry.step.order ?? 0)
          : (lastEntry.node.step.order ?? 0)
        : 0;

      entries.push({
        kind: "thinking",
        step: {
          step_id: "done",
          status: "success",
          type: "thinking",
          title: "done",
          message: "完成",
          timestamp: new Date().toISOString(),
          order: lastOrder + 1,
        } as TraceStep,
      });
    }

    return entries;
  }, [isThinking, orderedThoughtSteps, traceDisplaySteps]);

  if (!hasThoughtPanel) return null;

  return (
    <div className="mb-2.5">
      <button
        className="inline-flex items-center gap-1 bg-transparent p-0 text-[0.8125rem] text-(--text-muted) transition-colors duration-100 hover:text-(--text-primary)"
        onClick={() => setReasoningExpanded((value) => !value)}
        aria-expanded={reasoningExpanded || isThinking}
        type="button"
      >
        <span className="max-w-105 overflow-hidden text-ellipsis whitespace-nowrap font-normal">
          {isThinking ? "思考中…" : "思考过程"}
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
          className={`shrink-0 opacity-60 transition-transform duration-200 ${reasoningExpanded || isThinking ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200"
        style={{
          gridTemplateRows: reasoningExpanded || isThinking ? "1fr" : "0fr",
        }}
      >
        <div className="min-h-0 overflow-hidden pl-1 pt-1.5">
          {reasoningTimeline.length > 0 && (
            <div className="flex flex-col gap-0">
              {reasoningTimeline.map((entry, index) =>
                entry.kind === "thinking" ? (
                  <ThoughtStepItem
                    key={`${entry.step.step_id}-${index}`}
                    step={entry.step}
                    isLast={index === reasoningTimeline.length - 1}
                  />
                ) : (
                  <TraceStepItem
                    key={entry.node.step.step_id}
                    node={entry.node}
                    isLast={index === reasoningTimeline.length - 1}
                  />
                ),
              )}
            </div>
          )}

          {!isThinking && !orderedThoughtSteps.length && (
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
  );
}
