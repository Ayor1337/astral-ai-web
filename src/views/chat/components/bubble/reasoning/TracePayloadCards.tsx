import type { SearchResultItem, TraceStep } from "@/types/types";

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

function FetchPayloadCard({ payload }: { payload: Record<string, unknown> }) {
  const url = typeof payload.url === "string" ? payload.url : undefined;
  const httpStatus =
    typeof payload.http_status === "number" ? payload.http_status : undefined;
  const errorMessage =
    typeof payload.error_message === "string"
      ? payload.error_message
      : undefined;

  return (
    <div className="mt-2 flex flex-col gap-1 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 text-[0.75rem] text-(--text-muted)">
      {url && <span className="break-all">{url}</span>}
      {httpStatus != null && <span>HTTP {httpStatus}</span>}
      {errorMessage && <span className="text-[#ef4444]">{errorMessage}</span>}
    </div>
  );
}

function RetryPayloadCard({ payload }: { payload: Record<string, unknown> }) {
  const reason =
    typeof payload.reason === "string" ? payload.reason : undefined;
  if (!reason) return null;

  return (
    <div className="mt-2 rounded-lg border border-(--surface-border) bg-(--surface) px-3 py-2 text-[0.75rem] text-(--text-muted)">
      {reason}
    </div>
  );
}

function ToolCallPayloadCard({ step }: { step: TraceStep }) {
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

export function TracePayloadCard({ step }: { step: TraceStep }) {
  if (step.type === "search" && step.payload) {
    const items =
      (step.payload.results as SearchResultItem[] | undefined) ?? [];
    return <SearchPayloadCard items={items} />;
  }

  if (step.type === "fetch" && step.payload) {
    return <FetchPayloadCard payload={step.payload} />;
  }

  if (step.type === "retry" && step.payload) {
    return <RetryPayloadCard payload={step.payload} />;
  }

  if (step.type === "tool_call" || step.type === "tool_result") {
    return <ToolCallPayloadCard step={step} />;
  }

  return null;
}
