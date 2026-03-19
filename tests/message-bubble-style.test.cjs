const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const indexCssPath = path.join(__dirname, "..", "src", "index.css");
const css = fs.readFileSync(indexCssPath, "utf8");

assert.equal(
  css.includes(".msg-user-bubble {"),
  true,
  "缺少 .msg-user-bubble 样式块",
);
assert.equal(
  css.includes("background: var(--msg-user-bg);"),
  true,
  "用户消息气泡必须恢复背景色",
);
assert.equal(
  css.includes(".msg-ai-text {"),
  true,
  "缺少 .msg-ai-text 样式块",
);

console.log("PASS 用户消息与 AI 文本基础样式存在");
