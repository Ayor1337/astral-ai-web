import type { TraceNode } from "../messageBubble.utils";
import { TraceStatusIcon } from "./TraceStatusIcon";
import { TracePayloadCard } from "./TracePayloadCards";

export function TraceStepItem({
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
