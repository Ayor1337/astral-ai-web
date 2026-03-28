import type { TraceStep } from "@/types/types";
import { Spinner } from "../messageBubble.shared.tsx";

export function ThoughtStepItem({
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
