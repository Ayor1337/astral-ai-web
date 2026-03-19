# Repository Guidelines

## Project Structure & Module Organization

这是一个基于 Vite 的 React 19 + TypeScript 前端仓库。主要代码位于 `src/`：`components/` 放通用组件，`views/chat/` 放聊天页与子组件，`hooks/` 放自定义 Hook，`services/api.ts` 负责后端请求。静态资源在 `public/`，后端接口契约在 `docs/api.md`，轻量回归测试在 `tests/`。`dist/` 为构建产物，不应手动编辑。

## Build, Test, and Development Commands

- `pnpm dev`: 启动本地开发服务器。
- `pnpm build`: 先执行 TypeScript 构建，再输出生产包到 `dist/`。
- `pnpm lint`: 运行 ESLint 检查整个仓库。
- `pnpm preview`: 本地预览已构建产物。
- `node tests/chat-stop-reset.test.cjs`: 运行单个回归测试。

当前仓库没有统一的 `test` script；新增测试后，保持可通过 `node tests/<name>.test.cjs` 直接执行。

## Coding Style & Naming Conventions

使用 TypeScript ES modules、2 空格缩进，并保持与现有文件一致的双引号风格。React 组件文件使用 PascalCase，例如 `MessageBubble.tsx`；Hook 使用 `useXxx` 命名；普通工具与服务文件使用 camelCase。优先复用现有目录边界，不要把聊天页逻辑散落到无关模块。提交前至少运行 `pnpm lint`。

## Testing Guidelines

测试目前采用 Node 内置断言 (`node:assert/strict`) 配合 `.test.cjs` 文件，对关键 UI 逻辑做源码级回归保护。新测试放在 `tests/`，命名遵循 `<feature>.test.cjs`。优先覆盖聊天停止、列表渲染、空闲态和 SSE 相关回归；涉及接口字段变更时，同步核对 `docs/api.md`。

## Commit & Pull Request Guidelines

当前分支尚无历史提交，可从现在开始采用 Conventional Commits，例如 `feat: add chat header actions`、`fix: preserve idle logo state`。PR 应包含变更摘要、手动验证步骤、相关 issue；若修改 UI，请附截图或录屏；若调整接口契约，请明确指出受影响的 SSE 事件或 API 字段。

## Security & Configuration Tips

不要提交 `.env`、API key 或后端凭据。前端联调前先确认后端基础地址与 `docs/api.md` 一致，尤其是 `/api/chat/stream`、`run_id` 和停止接口的时序约定。
