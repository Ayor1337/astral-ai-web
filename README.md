# Astral AI Web

一个面向聊天场景的前端项目，基于 React 19、TypeScript 和 Vite 构建。当前实现了首页、发起新对话页、会话列表、流式聊天、停止生成、会话重命名/删除，以及思考链与执行轨迹展示。

对应的后端项目：`https://github.com/Ayor1337/astral-ai-langchain-project`

## 技术栈

- React 19
- TypeScript
- Vite 8
- React Router 7
- Tailwind CSS 4
- React Markdown + GFM

## 主要功能

- `/` 首页落地页
- `/new` 新建对话入口，支持快捷提示词
- `/chat` 与 `/chat/:id` 会话页
- SSE 流式回复展示
- `thinking_enabled` 模式下的 `thought_step` / `trace_step` 渲染
- 停止当前生成、重试消息、编辑最后一条用户消息
- 会话列表查询、重命名、删除

## 本地开发

先安装依赖：

```bash
pnpm install
```

常用命令：

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

说明：

- `pnpm dev`：启动本地开发服务器
- `pnpm build`：执行 TypeScript 构建并产出 `dist/`
- `pnpm lint`：运行 ESLint
- `pnpm preview`：预览生产构建结果

## 后端依赖

前端默认请求 `http://127.0.0.1:8000`，定义在 [src/services/api.ts](/E:/Projects/astral-ai/src/services/api.ts)。联调前请先启动对应后端，并确保以下接口可用：

- `GET /api/conversations`
- `GET /api/conversations/{conversation_id}`
- `POST /api/chat/stream`
- `POST /api/chat/runs/{run_id}/stop`
- `PATCH /api/conversations/{conversation_id}`
- `DELETE /api/conversations/{conversation_id}`

接口事件时序与字段说明见 [docs/api.md](/E:/Projects/astral-ai/docs/api.md)。

## 目录结构

```text
src/
  components/        通用组件
  hooks/             自定义 Hook
  services/          API 与 SSE 客户端
  views/chat/        聊天页、类型定义与子组件
tests/               轻量回归测试
public/              静态资源
docs/                项目文档与接口约定
```

## 测试

当前仓库没有统一的 `pnpm test` 脚本，测试以 `tests/*.test.cjs` 形式存在，适合做关键 UI 回归检查。例如：

```bash
node tests/chat-stop-reset.test.cjs
node tests/message-list-animation.test.cjs
```

## 备注

- 当前 `BASE_URL` 为硬编码；如果后端地址变化，请同步修改 [src/services/api.ts](/E:/Projects/astral-ai/src/services/api.ts)。
- `README` 之外的协作规范见 [AGENTS.md](/E:/Projects/astral-ai/AGENTS.md)。
