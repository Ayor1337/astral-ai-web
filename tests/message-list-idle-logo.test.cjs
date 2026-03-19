const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(__dirname, "..", "src", "views", "chat", "components", "MessageList.tsx");
const source = fs.readFileSync(filePath, "utf8");

assert.equal(
  source.includes("const [isIdleThinking, setIsIdleThinking] = useState(false);"),
  true,
  "idle logo 点击后需要本地思考动画状态",
);
assert.equal(
  source.includes("const handleIdleLogoClick = useCallback(() => {"),
  true,
  "缺少 idle logo 点击处理函数",
);
assert.equal(
  source.includes("setIsIdleThinking(true);"),
  true,
  "点击 idle logo 后应触发思考动画",
);
assert.equal(
  source.includes("className=\"typing-logo-button\""),
  true,
  "idle logo 应渲染为可点击按钮",
);

console.log("PASS idle logo 可点击触发思考动画的源码入口存在");
