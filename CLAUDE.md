# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个现代化的AI聊天前端应用，基于React 19、TypeScript、Vite构建。项目实现了流式对话、思考链展示、会话管理等核心功能，使用Tailwind CSS 4进行样式设计。

## 核心开发命令

### 开发环境
```bash
pnpm install    # 安装依赖
pnpm dev       # 启动开发服务器 (默认端口: 5173)
pnpm build     # TypeScript构建 + Vite生产打包
pnpm lint      # 运行ESLint检查
pnpm preview   # 预览生产构建
```

### 测试命令
项目使用自定义测试方式，执行特定测试文件：
```bash
node tests/chat-stop-reset.test.cjs          # 聊天停止重置测试
node tests/message-list-animation.test.cjs   # 消息列表动画测试
node tests/message-list-idle-logo.test.cjs   # 空闲Logo测试
node tests/message-bubble-style.test.cjs     # 消息气泡样式测试
```

## 技术栈架构

### 核心技术
- **React 19**: 使用最新React特性，包括React Compiler支持
- **TypeScript**: 严格模式配置，路径别名@/*指向src/*
- **Vite 8**: 开发服务器和构建工具
- **React Router 7**: 客户端路由
- **Tailwind CSS 4**: 使用@tailwindcss/vite插件
- **Redux Toolkit**: 状态管理（@reduxjs/toolkit）
- **React Markdown + GFM**: Markdown渲染

### 构建配置
- **Babel**: 使用React Compiler预设，通过@rolldown/plugin-babel集成
- **ESLint**: 使用flat config模式，集成React和TypeScript规则
- **TypeScript**: 使用项目引用模式（tsconfig.json -> tsconfig.app.json + tsconfig.node.json）

## 项目结构

```
src/
├── components/        # 通用组件 (ThemeToggle等)
├── hooks/            # 自定义Hook (useTheme等)
├── services/         # API和SSE客户端 (api.ts)
├── theme/           # 主题系统 (uiTheme.ts)
├── types/           # TypeScript类型定义 (types.ts)
└── views/chat/      # 聊天功能相关
    ├── ChatPage.tsx          # 主聊天页面
    ├── new/                  # 新建对话
    └── components/           # 聊天子组件
        ├── ChatSidebar.tsx   # 侧边栏
        ├── ChatHeader.tsx    # 顶部栏
        ├── ChatInput.tsx     # 输入框
        ├── MessageList.tsx   # 消息列表
        ├── MessageBubble.tsx # 消息气泡
        ├── MessageChain.tsx  # 思考链组件
        └── ChainNode.tsx     # 链节点组件
```

## API集成架构

### 后端依赖
- **基础URL**: `http://127.0.0.1:8000` (硬编码在src/services/api.ts)
- **核心接口**:
  - `POST /api/chat/stream` - SSE流式对话
  - `POST /api/chat/runs/{run_id}/stop` - 停止生成
  - `GET/POST/PATCH/DELETE /api/conversations/*` - 会话管理

### SSE事件处理架构
流式聊天支持三种模式：
1. **Simple模式** (`thinking_enabled=false` + simple路由): `conversation -> chunk* -> done`
2. **Complex模式** (`thinking_enabled=false` + complex/agent): `conversation -> route -> planner_done -> trace_step* + chunk* -> trace_done -> done`
3. **Thinking模式** (`thinking_enabled=true`): `conversation -> thinking_block* -> trace_step* -> chunk* -> trace_done -> done`

## 状态管理架构

### 消息状态结构
核心Message接口支持多种显示模式：
- **基础消息**: id, role, content, timestamp
- **思考链**: `thoughtSteps[]`, `traceSteps[]`, `chainNodes[]`
- **流式状态**: `isTyping`, `reasoningStatus`, `isThinkingStreaming`
- **历史回放**: `content_blocks[]` (支持thinking+text block恢复)

### 主题系统
- 使用Context-based主题提供者
- CSS变量动态切换 (通过getUiThemeVars)
- 支持深色/浅色模式

## 开发规范

### 代码风格
- 使用2空格缩进，双引号字符串
- React组件采用PascalCase命名
- Hook使用useXxx命名模式
- 服务/工具文件使用camelCase

### 组件设计原则
- 聊天相关逻辑集中在views/chat/目录
- 通用组件放在components/目录
- 使用TypeScript strict模式
- 优先使用函数组件和Hooks

### 测试策略
- 使用Node.js内置断言进行回归测试
- 重点测试聊天停止、消息渲染、空闲状态逻辑
- 测试文件使用.test.cjs扩展名

## 调试与开发提示

### 本地开发
1. 确保后端服务运行在http://127.0.0.1:8000
2. 检查接口可用性（详见docs/api.md）
3. 使用浏览器开发者工具监控SSE连接

### 常见问题
- **SSE连接问题**: 检查后端CORS配置和Accept头
- **思考链不显示**: 确认thinking_enabled参数和事件处理逻辑
- **样式问题**: 检查CSS变量和主题切换状态
- **路由问题**: 确认React Router 7配置和路径匹配

### 重要文件说明
- `src/services/api.ts`: 所有API调用和SSE处理逻辑
- `src/types/types.ts`: 完整类型定义，包括SSE事件类型
- `docs/api.md`: 后端接口详细文档和调试示例
- `AGENTS.md`: 项目协作规范和代码风格指南