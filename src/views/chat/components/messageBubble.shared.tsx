import type { TraceStep } from "@/types/types";

export const iconButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-[7px] bg-transparent text-(--text-subtle) transition-[background,color] duration-100 hover:bg-[rgba(255,255,255,0.08)] hover:text-(--text-base)";

export const markdownClass =
  "max-w-full wrap-break-word text-[0.9375rem] leading-[1.7] text-(--text-base) [&_p]:mb-3 [&_p:last-child]:mb-0 [&_h1]:mb-[0.45em] [&_h1]:mt-[1.1em] [&_h1]:text-[1.35em] [&_h1]:font-semibold [&_h1]:leading-[1.35] [&_h1]:text-(--heading) [&_h2]:mb-[0.45em] [&_h2]:mt-[1.1em] [&_h2]:text-[1.2em] [&_h2]:font-semibold [&_h2]:leading-[1.35] [&_h2]:text-(--heading) [&_h3]:mb-[0.45em] [&_h3]:mt-[1.1em] [&_h3]:text-[1.08em] [&_h3]:font-semibold [&_h3]:leading-[1.35] [&_h3]:text-(--heading) [&_h4]:mb-[0.45em] [&_h4]:mt-[1.1em] [&_h4]:text-[1em] [&_h4]:font-semibold [&_h4]:leading-[1.35] [&_h4]:text-(--heading) [&_h5]:mb-[0.45em] [&_h5]:mt-[1.1em] [&_h5]:text-[1em] [&_h5]:font-semibold [&_h5]:leading-[1.35] [&_h5]:text-(--heading) [&_h6]:mb-[0.45em] [&_h6]:mt-[1.1em] [&_h6]:text-[1em] [&_h6]:font-semibold [&_h6]:leading-[1.35] [&_h6]:text-(--heading) [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-[0.2em] [&_blockquote]:my-3 [&_blockquote]:rounded-r bg-transparent [&_blockquote]:bg-[rgba(218,119,86,0.06)] [&_blockquote]:px-3.5 [&_blockquote]:py-1 [&_blockquote]:text-(--text-muted) [&_blockquote]:border-l-[3px] [&_blockquote]:border-(--highlight) [&_code]:rounded [&_code]:bg-[rgba(255,255,255,0.07)] [&_code]:px-1.5 [&_code]:py-[0.15em] [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-(--highlight) [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-(--surface-border) [&_pre]:bg-[rgba(10,8,5,0.55)] [&_pre]:px-4 [&_pre]:py-3.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.875em] [&_pre_code]:text-(--text-base) [&_hr]:my-4 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-(--divider) [&_a]:text-(--highlight) [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-(--highlight-strong) [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.9em] [&_th]:border [&_th]:border-(--surface-border) [&_th]:bg-[rgba(255,255,255,0.05)] [&_th]:px-3 [&_th]:py-[0.4em] [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-(--surface-border) [&_td]:px-3 [&_td]:py-[0.4em] [&_td]:text-left [&_tr:nth-child(even)_td]:bg-[rgba(255,255,255,0.025)] [&_strong]:font-bold [&_em]:italic [&_del]:text-(--text-subtle) [&_del]:line-through";

export interface TraceNode {
  step: TraceStep;
  children: TraceNode[];
}

export type TimelineEntry =
  | { kind: "thinking"; step: TraceStep }
  | { kind: "trace"; node: TraceNode };

export function Spinner({ subtle = false }: { subtle?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full border-solid animate-spin ${subtle ? "border-[1.5px] border-[color-mix(in_srgb,var(--text-muted)_25%,transparent)] border-t-(--text-muted)" : "border-[1.5px] border-(--text-subtle) border-t-(--accent)"}`}
      style={{ width: subtle ? 14 : 12, height: subtle ? 14 : 12 }}
    />
  );
}

export function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function buildTraceTree(steps: TraceStep[]): TraceNode[] {
  const sorted = [...steps]
    .filter((s) => s.type !== "tool_end")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
