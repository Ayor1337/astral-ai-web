import type { TraceStep } from "@/types/types";
import { Spinner } from "../messageBubble.shared.tsx";

export function TraceStatusIcon({ status }: { status: TraceStep["status"] }) {
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
