const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const messageListPath = path.join(__dirname, "..", "src", "views", "chat", "components", "MessageList.tsx");
const source = fs.readFileSync(messageListPath, "utf8");

assert.equal(
  source.includes("showBottomAnimation"),
  false,
  "空闲态常驻 logo 后，不应再用 showBottomAnimation 控制底部 logo 是否渲染",
);
assert.equal(
  source.includes(': "typing-logo";'),
  true,
  "空闲态应回退到静态 typing-logo 容器",
);

console.log("PASS 底部 Astral logo 常驻逻辑存在");
