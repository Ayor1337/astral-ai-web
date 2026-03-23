# 前端 `thinking_block` 单链路展示需求

## 背景

后端在 `thinking_enabled=true` 时，不再返回旧的 `thought_step` 包装事件，而是直接透传模型原始 `thinking_block`。  
前端的目标不是把这些事件拆成多个面板，而是把整轮执行过程渲染成一条连续的纵向链路，视觉上接近时间线。

这条链路需要把以下内容统一放进同一条主线里：

- 模型思考文本：`thinking_block`
- 执行轨迹节点：`trace_step`
- 最终回答文本：`chunk`

不要做成“左边思考、右边答案”或“上面思考、下面结果”的双栏/双面板结构。

## 总体要求

- 前端必须把一轮 assistant 响应渲染成一条连续链路。
- 链路按事件到达顺序追加，用户看到的是一个不断向下生长的过程。
- `thinking_block`、`trace_step`、`chunk` 都属于这条链上的节点。
- `conversation`、`trace_done`、`done` 属于生命周期事件，不单独渲染为链路节点。
- 同一轮内不要把思考文本和执行轨迹拆到不同容器中。

## 节点模型

### 1. 思考节点

来源：

- SSE `event: thinking_block`
- 历史回放时 `content_blocks` 中 `type=thinking` 的 block

示例：

```json
{
  "type": "thinking",
  "thinking": "先搜索可用的 IP 信息来源。",
  "signature": "sig-1",
  "index": 0
}
```

渲染要求：

- 作为链路中的“思考节点”显示。
- 同一轮内，如果连续收到相同 `index` 的 `thinking_block`，前端应追加到当前思考节点，而不是新建多个零碎节点。
- 思考节点默认展示为一段连续文本。
- 当思考文本过长时，前端可以折叠，但仍应保持它是链上的一个节点，而不是移到单独面板。
- 若需要“Show more”，它只作用于当前思考节点。

### 2. 轨迹节点

来源：

- SSE `event: trace_step`
- 历史回放时优先使用 `content_blocks` 中的非 `thinking` / 非 `text` block 构建顺序
- `trace_steps` 作为执行轨迹详情补充，不负责决定主链顺序

渲染要求：

- 每个 `trace_step` 是链上的独立节点。
- 常见节点类型包括：
  - `search`
  - `fetch`
  - `tool_call`
  - `tool_result`
  - `retry`
  - `other`
- 轨迹节点显示为结构化步骤卡片，但仍嵌在同一条主链上。
- 不要单独维护“工具轨迹侧栏”。

### 3. 回答节点

来源：

- SSE `event: chunk`
- 历史回放时 `content_blocks` 中 `type=text` 的 block

渲染要求：

- `chunk` 属于链上的“回答节点”。
- 连续文本分片应合并到当前回答节点中。
- 回答节点通常出现在链路后段，作为最终面向用户的输出。
- 不要把回答单独放到链路之外的独立结果面板。

## 实时渲染规则

前端应维护“当前轮链路”这一份状态，而不是三套分离状态。

建议规则如下：

1. 收到 `thinking_block`
- 若当前链尾已经是同 `index` 的思考节点，则追加 `thinking` 文本。
- 否则创建一个新的思考节点并挂到链尾。

2. 收到 `trace_step`
- 创建或更新一个轨迹节点。
- 该节点插入到当前链尾，保持时间顺序。

3. 收到 `chunk`
- 若当前链尾已经是回答节点，则追加文本。
- 否则创建新的回答节点并挂到链尾。

4. 收到 `trace_done` 或 `done`
- 只更新当前轮运行状态。
- 不新增“完成节点”。

## 历史回放规则

历史页面要尽量还原成与实时流一致的单链路结构。

主规则：

- 优先使用 assistant 消息的 `content_blocks` 作为链路重建来源，因为它保留了原始 block 顺序。
- `content_blocks` 中：
  - `type=thinking` 重建为思考节点
  - `type=text` 重建为回答节点
  - 其他 block 重建为轨迹节点
- `trace_steps` 只用于补充轨迹节点的结构化详情，不负责重新决定顺序。

这意味着历史回放的主链，不应该靠 `trace_steps` 单独拼装。

## 视觉要求

前端最终效果应接近你提供的截图表达：

- 一条明显的纵向主线
- 每个节点顺着主线向下排列
- 思考文本、工具动作、最终回答都在这条线里
- 用户读下来像是在看“这一轮 assistant 是怎么一步步走到答案的”

允许的视觉变化：

- 可以给思考节点、轨迹节点、回答节点不同图标
- 可以给长思考节点加折叠
- 可以给工具节点显示标题、状态、摘要

不允许的视觉变化：

- 双栏布局
- 单独的“thinking panel”
- 单独的“answer panel”
- 把思考链和工具链拆成两条并列时间线

## SSE 示例

```text
event: conversation
data: {"conversation_id":"0f31cc7e-0ec7-4d8f-9baf-84f7072a2a98","title":"新对话","run_id":"6e0f1938-897a-4dda-b17c-1c33d7ef8d24"}

event: thinking_block
data: {"type":"thinking","thinking":"先搜索可用的 IP 信息来源。","signature":"sig-1","index":0}

event: thinking_block
data: {"type":"thinking","thinking":"再整理抓取结果并准备回答。","signature":"sig-1","index":0}

event: trace_step
data: {"step_id":"search-1","type":"search","status":"success","message":"先搜索可用的 IP 查询站点。","timestamp":"2026-03-18T12:00:02+00:00","order":1}

event: chunk
data: {"content":"我先查一下这个 IP 的信息。"}

event: trace_done
data: {"status":"completed"}

event: done
data: {"status":"completed","run_id":"6e0f1938-897a-4dda-b17c-1c33d7ef8d24"}
```

对应前端链路应表现为：

1. 思考节点：`先搜索可用的 IP 信息来源。再整理抓取结果并准备回答。`
2. 轨迹节点：`搜索 IP 信息`
3. 回答节点：`我先查一下这个 IP 的信息。`

## 验收标准

- `thinking_enabled=true` 时，前端实时展示为一条连续纵向链路。
- 同一 `index` 的连续 `thinking_block` 会聚合成同一个思考节点。
- `trace_step` 会作为链上的独立步骤出现，而不是单独侧栏。
- `chunk` 会作为链上的回答节点出现，而不是独立结果面板。
- 历史刷新后，前端能基于 `content_blocks` 恢复出与实时流一致的单链结构。
