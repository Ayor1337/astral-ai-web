// ── Structured payload card types ───────────────────

export interface SearchResultItem {
  title: string;
  url: string;
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

// ── Trace step (structured execution trace) ─────────

export interface TraceStep {
  step_id: string;
  parent_step_id?: string;
  type:
    | "thinking"
    | "search"
    | "fetch"
    | "tool_call"
    | "tool_result"
    | "tool_end"
    | "retry"
    | "other";
  status: "pending" | "running" | "success" | "error" | "skipped";
  title?: string;
  message?: string;
  thinking?: string; // 新增: thinking内容
  signature?: string; // 新增: thinking签名
  index?: number; // 新增: thinking索引
  kind?: string;
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

// ── Frontend message ─────────────────────────────────

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string; // ISO timestamp
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
  trace_steps: TraceStep[] | null;
  sequence: number;
  created_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: MessageAPI[];
}

// ── Auth types ───────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}
