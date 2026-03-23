import type {
  ConversationSummary,
  ConversationDetail,
  TraceStep,
} from "../types/types";

const BASE_URL = "http://127.0.0.1:8000";

export async function createConversation(): Promise<ConversationSummary> {
  const res = await fetch(`${BASE_URL}/api/conversations`, { method: "POST" });
  if (!res.ok) throw new Error(`createConversation failed: ${res.status}`);
  return res.json();
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${BASE_URL}/api/conversations`);
  if (!res.ok) throw new Error(`getConversations failed: ${res.status}`);
  return res.json();
}

export async function getConversationDetail(
  id: string,
): Promise<ConversationDetail> {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`);
  if (!res.ok) throw new Error(`getConversationDetail failed: ${res.status}`);
  return res.json();
}

export async function updateConversationTitle(
  id: string,
  title: string,
): Promise<ConversationSummary> {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`updateConversationTitle failed: ${res.status}`);
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deleteConversation failed: ${res.status}`);
}

export async function stopChatRun(runId: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/chat/runs/${encodeURIComponent(runId)}/stop`,
    {
      method: "POST",
    },
  );
  // 404 means the run already ended — treat as success
  if (!res.ok && res.status !== 404) {
    throw new Error(`stopChatRun failed: ${res.status}`);
  }
}

// ── SSE streaming chat ───────────────────────────────

export interface StreamCallbacks {
  onConversation: (
    conversationId: string,
    title: string,
    runId: string,
  ) => void;
  onChunk: (content: string) => void;
  onTraceStep: (step: TraceStep) => void;
  onTraceDone: (status: string) => void;
  onDone: (status: string, runId: string) => void;
  onError: (detail: string) => void;
}

export async function streamChat(
  conversationId: string | null,
  message: string,
  thinkingEnabled: boolean,
  callbacks: StreamCallbacks,
): Promise<void> {
  const body: Record<string, unknown> = { message };
  if (conversationId) body.conversation_id = conversationId;
  if (thinkingEnabled) body.thinking_enabled = true;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    callbacks.onError(e instanceof Error ? e.message : "network error");
    return;
  }

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ detail: "stream failed" }));
    callbacks.onError((err as { detail?: string }).detail ?? "stream failed");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by \n\n
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split("\n");
      let eventType = "message";
      let dataStr = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) eventType = line.slice(7).trim();
        else if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
      }
      if (!dataStr) continue;
      try {
        const data = JSON.parse(dataStr) as Record<string, unknown>;
        switch (eventType) {
          case "conversation":
            callbacks.onConversation(
              data.conversation_id as string,
              data.title as string,
              data.run_id as string,
            );
            break;
          case "chunk":
            callbacks.onChunk(data.content as string);
            break;
          case "trace_step":
            callbacks.onTraceStep(data as unknown as TraceStep);
            break;
          case "trace_done":
            callbacks.onTraceDone((data.status as string) ?? "completed");
            break;
          case "done":
            callbacks.onDone(
              (data.status as string) ?? "completed",
              (data.run_id as string) ?? "",
            );
            break;
          case "error":
            callbacks.onError((data.detail as string) ?? "unknown error");
            break;
          // Silently ignore reserved protocol events
          // (tool_call_start, tool_call_delta, tool_call_end, tool_result)
        }
      } catch {
        // ignore parse errors on malformed SSE frames
      }
    }
  }
}
