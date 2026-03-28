import { useMemo, useState } from "react";
import type { TraceStep } from "@/types/types";
import { buildTraceTree, type TimelineEntry } from "../messageBubble.utils";
import { ThoughtStepItem } from "./ThoughtStepItem";
import { TraceStepItem } from "./TraceStepItem";

export default function ReasoningPanel({
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
