// ── Structured payload card types ───────────────────

export interface SearchResultItem {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
}

export interface FetchCardPayload {
  url?: string;
  status?: string;
  http_status?: number;
  error_code?: string;
  error_message?: string;
}

export interface RetryCardPayload {
  reason?: string;
}

export interface ToolCardPayload {
  tool_name?: string;
  input?: unknown;
  output?: unknown;
}

// ── Thought step (thought_step SSE event) ──────────

export interface ThoughtStep {
  step_id: string;
  type: "thought";
  status: "running" | "success" | "skipped";
  title: string;
  message?: string;
  timestamp: string;
  order?: number;
}

// ── Trace step (structured execution trace) ─────────

export interface TraceStep {
  step_id: string;
  parent_step_id?: string;
  type:
    | "thought"
    | "search"
    | "fetch"
    | "tool_call"
    | "tool_result"
    | "retry"
    | "other";
  kind?: string;
  status: "pending" | "running" | "success" | "error" | "skipped";
  title: string;
  message?: string;
  url?: string;
  query?: string;
  result_count?: number;
  error_code?: string;
  error_message?: string;
  timestamp: string;
  tool_name?: string;
  input_json?: string;
  output_json?: string;
  duration_ms?: number;
  retry_of?: string;
  order?: number;
  payload?: Record<string, unknown>;
}

// ── Planner route result ─────────────────────────────

export interface PlannerRoute {
  route: "simple" | "complex" | "agent";
  plan?: string[];
  tools?: string[];
}

// ── Frontend message ─────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string; // ISO timestamp
  /** Streaming / final reasoning summary text (legacy) */
  reasoning?: string;
  reasoningStatus?: "streaming" | "completed" | "failed";
  /** Discrete thought steps from thought_step SSE events */
  thoughtSteps?: ThoughtStep[];
  traceSteps?: TraceStep[];
}

export interface Conversation {
  id: string;
  title: string;
}

// ── API response shapes ──────────────────────────────

export interface ConversationSummary {
  id: string;
  title: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageAPI {
  role: "user" | "assistant";
  content: string;
  reasoning_summary: string | null;
  trace_steps: TraceStep[] | null;
  sequence: number;
  created_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: MessageAPI[];
}
