const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const projectRoot = path.resolve(__dirname, "..");
const messageListPath = path.join(
  projectRoot,
  "src/views/chat/components/MessageList.tsx",
);
const indexCssPath = path.join(projectRoot, "src/index.css");

const assistantMessage = {
  id: "assistant-1",
  role: "assistant",
  content: "Astral 正在输出。",
  ts: "2026-03-19T08:00:00.000Z",
};

function loadMessageListComponent() {
  const source = fs
    .readFileSync(messageListPath, "utf8")
    .replace(
      'import MessageBubble from "./MessageBubble";',
      "const MessageBubble = () => null;",
    );

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: messageListPath,
  });

  const compiledModule = new Module.Module(messageListPath, module);
  compiledModule.filename = messageListPath;
  compiledModule.paths = Module.Module._nodeModulePaths(path.dirname(messageListPath));
  compiledModule._compile(outputText, messageListPath);
  return compiledModule.exports.default;
}

function renderMessageList(props = {}) {
  const MessageList = loadMessageListComponent();
  return renderToStaticMarkup(
    React.createElement(MessageList, {
      messages: [assistantMessage],
      isTyping: false,
      streamingMsgId: null,
      isBusy: false,
      ...props,
    }),
  );
}

function countOccurrences(markup, needle) {
  return markup.split(needle).length - 1;
}

function runCase(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runCase("空闲时也显示底部共享 Astral logo，但不播放动画", () => {
  const markup = renderMessageList();

  assert.equal(countOccurrences(markup, `class="typing-logo"`), 1);
  assert.equal(markup.includes("typing-logo--pulse"), false);
  assert.equal(markup.includes("typing-logo--streaming"), false);
  assert.equal(markup.includes('viewBox="0 0 100 700"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 800"'), false);
});

runCase("思考态只在底部共享位置渲染 7 帧动画", () => {
  const markup = renderMessageList({
    isTyping: true,
    streamingMsgId: assistantMessage.id,
  });

  assert.equal(countOccurrences(markup, `class="typing-logo typing-logo--pulse"`), 1);
  assert.equal(markup.includes("typing-logo--pulse"), true);
  assert.equal(markup.includes("typing-logo--streaming"), false);
  assert.equal(markup.includes('viewBox="0 0 100 700"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 800"'), false);
});

runCase("流式态在同一底部位置切换为 8 帧动画", () => {
  const markup = renderMessageList({
    streamingMsgId: assistantMessage.id,
    isBusy: true,
  });

  assert.equal(countOccurrences(markup, `class="typing-logo typing-logo--streaming"`), 1);
  assert.equal(markup.includes("typing-logo--pulse"), false);
  assert.equal(markup.includes("typing-logo--streaming"), true);
  assert.equal(markup.includes('viewBox="0 0 100 700"'), false);
  assert.equal(markup.includes('viewBox="0 0 100 800"'), true);
});

runCase("样式改为共享流式动画类，并移除正文内联 streaming-logo 样式入口", () => {
  const css = fs.readFileSync(indexCssPath, "utf8");

  assert.equal(css.includes(".typing-logo--streaming"), true);
  assert.equal(css.includes(".streaming-logo {"), false);
});

console.log("All assertions passed.");
