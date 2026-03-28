const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const indexCssPath = path.join(__dirname, "..", "src", "index.css");
const messageBubblePath = path.join(
  __dirname,
  "..",
  "src",
  "views",
  "chat",
  "components",
  "bubble",
  "MessageBubble.tsx",
);

const css = fs.readFileSync(indexCssPath, "utf8");
const source = fs.readFileSync(messageBubblePath, "utf8");

assert.equal(
  css.trim(),
  '@import "tailwindcss";',
  "index.css 应只保留 Tailwind 入口",
);
assert.equal(
  css.includes(".msg-user-bubble {"),
  false,
  "不应继续在 index.css 中保留用户消息气泡业务样式",
);
assert.equal(
  css.includes(".msg-ai-text {"),
  false,
  "不应继续在 index.css 中保留 AI 文本业务样式",
);
assert.equal(
  source.includes("max-w-[80%]"),
  true,
  "用户消息或编辑态容器应迁移到 Tailwind 宽度约束",
);
assert.equal(
  source.includes("[&_pre]:overflow-x-auto"),
  true,
  "Markdown 代码块样式应迁移到 Tailwind arbitrary variants",
);
assert.equal(
  source.includes("[&_blockquote]:border-l-[3px]"),
  true,
  "Markdown 引用块样式应迁移到 Tailwind arbitrary variants",
);

console.log("PASS MessageBubble 业务样式已迁移到 Tailwind 类");
