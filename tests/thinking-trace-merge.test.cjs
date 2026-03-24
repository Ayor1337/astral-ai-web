const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const chatPagePath = path.join(
  __dirname,
  "..",
  "src",
  "views",
  "chat",
  "ChatPage.tsx",
);

const source = fs.readFileSync(chatPagePath, "utf8");

assert.equal(
  source.includes(
    "function mergeStreamingText(previous: string, incoming: string)",
  ),
  true,
  "应有独立的流式思考文本合并函数，避免直接在 onTraceStep 中拼接",
);

assert.equal(
  source.includes("incoming.startsWith(previous)"),
  true,
  "合并逻辑应优先识别全量快照，避免把完整文本再次追加到前面",
);

assert.equal(
  source.includes("previous.endsWith(incoming.slice(0, size))"),
  true,
  "合并逻辑应处理有重叠的增量片段，避免重复拼接边界文本",
);

assert.equal(
  source.includes("...steps[idx],") && source.includes("...step,"),
  true,
  "更新 running thinking 节点时应保留旧节点字段后再叠加新字段",
);

assert.equal(
  source.includes("thinking: mergeStreamingText("),
  true,
  "running thinking 节点应通过 mergeStreamingText 合并，而不是直接字符串相加",
);

console.log("PASS thinking trace streaming merge logic exists");
