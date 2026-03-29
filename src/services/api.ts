import type {
  ConversationSummary,
  ConversationDetail,
  TraceStep,
  AuthUser,
  AuthResponse,
} from "../types/types";

/** 后端服务的基础地址 */
const BASE_URL = "http://127.0.0.1:8000";

/** 从 localStorage 读取 token，返回含 Authorization 头的对象 */
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth API ─────────────────────────────────────────

/** 登录，返回 token 和用户信息 */
export async function loginApi(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "login failed" }));
    throw new Error((err as { detail?: string }).detail ?? "login failed");
  }
  return res.json();
}

/** 注册新用户，返回 token 和用户信息 */
export async function registerApi(
  username: string,
  nickname: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, nickname, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "register failed" }));
    throw new Error((err as { detail?: string }).detail ?? "register failed");
  }
  return res.json();
}

/** 获取当前登录用户的信息 */
export async function getMe(): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`getMe failed: ${res.status}`);
  return res.json();
}

/** 创建新会话，返回会话摘要信息 */
export async function createConversation(): Promise<ConversationSummary> {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`createConversation failed: ${res.status}`);
  return res.json();
}

/** 获取所有会话的摘要列表 */
export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${BASE_URL}/api/conversations`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`getConversations failed: ${res.status}`);
  return res.json();
}

/** 根据会话 ID 获取完整的会话详情（含历史消息） */
export async function getConversationDetail(
  id: string,
): Promise<ConversationDetail> {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`getConversationDetail failed: ${res.status}`);
  return res.json();
}

/** 更新指定会话的标题 */
export async function updateConversationTitle(
  id: string,
  title: string,
): Promise<ConversationSummary> {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`updateConversationTitle failed: ${res.status}`);
  return res.json();
}

/** 删除指定会话及其所有消息 */
export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`deleteConversation failed: ${res.status}`);
}

/** 停止正在进行的聊天 run；404 表示 run 已自然结束，视为成功 */
export async function stopChatRun(runId: string): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/chat/runs/${encodeURIComponent(runId)}/stop`,
    {
      method: "POST",
      headers: authHeaders(),
    },
  );
  // 404 说明 run 已经结束，视为成功，无需报错
  if (!res.ok && res.status !== 404) {
    throw new Error(`stopChatRun failed: ${res.status}`);
  }
}

// ── SSE 流式聊天 ────────────────────────────────────

/** SSE 各事件对应的回调函数集合 */
export interface StreamCallbacks {
  /** 流建立成功，后端已创建或续接会话；返回 conversationId、title 和本次 runId */
  onConversation: (
    conversationId: string,
    title: string,
    runId: string,
  ) => void;
  /** 收到一段文字增量（delta chunk） */
  onChunk: (content: string) => void;
  /** 收到一个思考链 / 追踪步骤节点 */
  onTraceStep: (step: TraceStep) => void;
  /** 思考链追踪阶段结束 */
  onTraceDone: (status: string) => void;
  /** 首轮对话标题生成完成，返回 conversationId 和新标题 */
  onConversationTitle?: (conversationId: string, title: string) => void;
  /** 整个 run 结束，携带最终状态和 runId */
  onDone: (status: string, runId: string) => void;
  /** 发生错误（网络异常或后端返回 error 事件） */
  onError: (detail: string) => void;
}

/**
 * 发起 SSE 流式聊天请求，通过 callbacks 将事件实时分发给调用方。
 * @param conversationId 已有会话 ID，传 null 则由后端新建会话
 * @param message 用户输入的消息文本
 * @param thinkingEnabled 是否开启思维链模式
 * @param callbacks 各 SSE 事件的处理回调
 */
export async function streamChat(
  conversationId: string | null,
  message: string,
  thinkingEnabled: boolean,
  searchEnabled: boolean,
  callbacks: StreamCallbacks,
): Promise<void> {
  // 按需组装请求体，避免可选字段以空值形式发送
  const body: Record<string, unknown> = { message };
  if (conversationId) body.conversation_id = conversationId;
  if (thinkingEnabled) body.thinking_enabled = true;
  if (searchEnabled) body.search_enabled = true;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    callbacks.onError(e instanceof Error ? e.message : "network error");
    return;
  }

  if (!res.ok || !res.body) {
    // 流初始化失败时，后端可能仍会返回 JSON 格式的错误详情
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
    // 保持流式解码，防止多字节 UTF-8 字符在帧边界处被截断
    buffer += decoder.decode(value, { stream: true });

    // SSE 协议以 \n\n 作为事件分隔符
    const parts = buffer.split("\n\n");
    // 末尾不完整的片段留到下次读取后继续拼接
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split("\n");
      let eventType = "message";
      let dataStr = "";
      for (const line of lines) {
        // 最小化 SSE 解析：仅处理 event 和 data 两个字段
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
          case "conversation_title":
            callbacks.onConversationTitle?.(
              data.conversation_id as string,
              data.title as string,
            );
            break;
          case "error":
            callbacks.onError((data.detail as string) ?? "unknown error");
            break;
          // 协议保留事件（tool_call_start/delta/end, tool_result）暂不处理，静默忽略
        }
      } catch {
        // 忽略格式异常的 SSE 帧导致的 JSON 解析错误
      }
    }
  }
}
