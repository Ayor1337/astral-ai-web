# 认证接口接入设计文档

**日期**：2026-03-28
**范围**：登录、注册、Token 管理、路由守卫、Settings 真实化

---

## 背景

后端已提供完整的 JWT 认证接口（`POST /api/auth/register`、`POST /api/auth/login`、`GET /api/auth/me`），但前端登录/注册页面仅有 UI 骨架，表单字段与 API 不匹配，所有 API 调用均缺少 `Authorization` 头，亦无认证状态管理和路由保护。

---

## 目标

1. 接入登录、注册 API，完成 token 获取与持久化
2. 所有受保护接口携带 `Authorization: Bearer <token>` 头
3. 未登录用户访问受保护路由时自动跳转 `/login`
4. 已登录用户访问 `/login`、`/register` 时自动跳转 `/chat`
5. Settings Account 页展示真实用户信息，退出登录功能可用

---

## 架构设计

### 认证状态管理：`src/hooks/useAuth.tsx`

新建文件，采用与现有 `ThemeProvider` 完全相同的 Context 模式。

**Context 数据结构：**
```ts
interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, nickname: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**持久化策略：**
- localStorage key：`auth_token`（string）、`auth_user`（JSON string）
- 应用启动时从 localStorage 读取初始状态
- 登录/注册成功后写入 localStorage
- `logout()` 清除 localStorage，重置 Context，跳转 `/login`

**Token 过期处理策略：**
- `AuthProvider` 初始化时（页面刷新/首次加载），若 localStorage 中存在 token，调用 `GET /api/auth/me` 验证有效性
- 若 `/api/auth/me` 返回 401，清除 localStorage 并将 `token`/`user` 置 null（用户需重新登录）
- 若 `/api/auth/me` 成功，使用返回的最新用户信息更新 `user` state
- 验证期间使用内部 `isInitializing` state 控制，路由守卫在初始化完成前渲染 null（避免闪烁跳转）

**isLoading 语义：**
- `isLoading` 仅表示 `login()` / `register()` 请求进行中，用于控制按钮禁用状态
- 初始化验证使用独立的内部 `isInitializing` state，不对外暴露

**跳转职责：**
- `login()` / `register()` 只负责状态更新，**不包含导航逻辑**
- 跳转由 `LoginPage` / `RegisterPage` 组件在 `await login()` 成功后调用 `navigate('/chat')`

**错误处理：**
- `login` / `register` 抛出 `Error`，message 为后端返回的 `detail` 字段
- 调用方（页面组件）捕获错误并展示 inline 错误提示

---

### API 层补全：`src/services/api.ts`

**API 层认证头实现说明：**
- `authHeaders()` 直接读取 `localStorage['auth_token']`（简化设计，接受与 Context 状态双源）
- 401 响应处理不在本期范围（与 token 刷新一并推后，属已知简化）
- `streamChat` 同样需在请求头中加入认证 token

**新增认证函数：**
```ts
login(username, password) → AuthResponse
register(username, nickname, password) → AuthResponse
getMe() → AuthUser
```

**AuthResponse 结构：**
```ts
interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}
```

**现有接口补充认证头：**

新增内部工具函数 `authHeaders()`，从 localStorage 读取 `auth_token`，返回含 `Authorization: Bearer <token>` 的 headers 对象。所有现有接口（`createConversation`、`getConversations`、`getConversationDetail`、`updateConversationTitle`、`deleteConversation`、`stopChatRun`、`streamChat`）均通过此函数注入认证头。

---

### 登录页修正：`src/views/auth/LoginPage.tsx`

**字段变更：**
- 移除「邮箱」字段（`type="email"`）
- 改为「用户名」字段（`id="username"`，`type="text"`）
- 密码字段保持不变

**交互行为：**
- 提交时调用 `useAuth().login(username, password)`
- 成功：`navigate("/chat")`
- 失败：在提交按钮上方展示 inline 错误文字（红色，`text-sm`）
- 加载中：按钮禁用，文字显示「登录中…」

---

### 注册页修正：`src/views/auth/RegisterPage.tsx`

**字段变更：**
- 移除「邮箱」字段
- 移除「确认密码」字段
- 保留「用户名」（`username`）
- 新增「昵称」（`nickname`，`type="text"`）
- 保留「密码」（`password`）

**字段映射（注册页）：**

| UI 标签 | 表单字段名 | API 字段 |
|---------|-----------|---------|
| 用户名 | `username` | `username` |
| 昵称 | `nickname` | `nickname` |
| 密码 | `password` | `password` |

**字段顺序：** 用户名 → 昵称 → 密码

**交互行为：**
- 提交时调用 `useAuth().register(username, nickname, password)`
- 成功：`navigate("/chat")`
- 失败：inline 错误提示（同登录页风格）
- 加载中：按钮禁用，文字显示「注册中…」

---

### 路由守卫：`src/main.tsx`

**组件树层级（关键）：**
```
<ThemeProvider>
  <AuthProvider>           ← 必须在 BrowserRouter 外层
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
        <Route path="/register" element={<RedirectIfAuthed><RegisterPage /></RedirectIfAuthed>} />
        <Route path="/chat" element={<RequireAuth><ChatView /></RequireAuth>} />
        ...
      </Routes>
    </BrowserRouter>
  </AuthProvider>
</ThemeProvider>
```

`AuthProvider` 必须在 `BrowserRouter` **外层**，使得守卫组件能消费 Context。`useNavigate` 不放在 `AuthProvider` 内，跳转逻辑由各页面组件自行调用。

新增 `RequireAuth` 组件：

```tsx
function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

新增 `RedirectIfAuthed` 组件（已登录用户访问登录/注册页时重定向）：

```tsx
function RedirectIfAuthed({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/chat" replace />;
  return children;
}
```

**路由保护配置：**

| 路径 | 守卫 | 说明 |
|------|------|------|
| `/` | 无 | 公开欢迎页，已登录仍可访问 |
| `/login` | `RedirectIfAuthed` | 已登录跳 `/chat` |
| `/register` | `RedirectIfAuthed` | 已登录跳 `/chat` |
| `/new` | `RequireAuth` | 未登录跳 `/login` |
| `/chat` | `RequireAuth` | 未登录跳 `/login` |
| `/chat/:id` | `RequireAuth` | 未登录跳 `/login` |
| `/settings/*` | `RequireAuth` | 未登录跳 `/login` |

---

### Settings Account 页真实化：`src/views/settings/components/SettingsAccount.tsx`

**整体删除（从 DOM 中移除）：**
- 硬编码的 `ORG_ID` 常量和「Organization ID」展示区块
- 硬编码的 `SESSIONS` 数组和「Active sessions」表格区块

**保留并真实化：**
- 「账号信息」区块：展示 `user.username`（用户名）和 `user.nickname`（昵称），从 `useAuth()` 获取
- 「退出登录」按钮：调用 `useAuth().logout()`，点击后跳转到 `/login`（logout 内部实现）

---

## 改动文件清单

| 文件 | 变更类型 |
|------|----------|
| `src/hooks/useAuth.tsx` | 新建 |
| `src/services/api.ts` | 修改（新增 auth 函数 + 所有接口加认证头） |
| `src/views/auth/LoginPage.tsx` | 修改（字段 + 接入逻辑） |
| `src/views/auth/RegisterPage.tsx` | 修改（字段 + 接入逻辑） |
| `src/main.tsx` | 修改（AuthProvider + 路由守卫） |
| `src/views/settings/components/SettingsAccount.tsx` | 修改（真实用户信息 + logout） |
| `src/types/types.ts` | 修改（新增 AuthUser、AuthResponse 类型） |

---

## 不在范围内

- Token 刷新（后端 JWT 有效期 7 天，暂不处理自动续期）
- 多标签页登出同步
- 记住我 / 会话选项
- 密码修改接口（API 未提供）
