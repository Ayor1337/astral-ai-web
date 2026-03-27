const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const projectRoot = path.resolve(__dirname, "..");
const typingLogoPath = path.join(
  projectRoot,
  "src/views/chat/components/TypingLogo.tsx",
);
const indexCssPath = path.join(projectRoot, "src/index.css");

function loadTypingLogoComponent() {
  const source = fs
    .readFileSync(typingLogoPath, "utf8")
    .replace(
      'import { THINKING_LOGO_PATH, STREAMING_LOGO_PATH } from "./Idle";',
      'const THINKING_LOGO_PATH = "M0 0"; const STREAMING_LOGO_PATH = "M0 0";',
    );

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: typingLogoPath,
  });

  const compiledModule = new Module.Module(typingLogoPath, module);
  compiledModule.filename = typingLogoPath;
  compiledModule.paths = Module.Module._nodeModulePaths(
    path.dirname(typingLogoPath),
  );
  compiledModule._compile(outputText, typingLogoPath);
  return compiledModule.exports.default;
}

function renderTypingLogo(state) {
  const TypingLogo = loadTypingLogoComponent();
  return renderToStaticMarkup(
    React.createElement(TypingLogo, {
      state,
      onIdleClick: () => {},
    }),
  );
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
  const markup = renderTypingLogo("idle");

  assert.equal(markup.includes('aria-label="触发思考动画"'), true);
  assert.equal(markup.includes('data-typing-state="idle"'), true);
  assert.equal(markup.includes('data-typing-viewbox="0 0 100 700"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 700"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 800"'), false);
});

runCase("思考态只在底部共享位置渲染 7 帧动画", () => {
  const markup = renderTypingLogo("thinking");

  assert.equal(markup.includes('data-typing-state="thinking"'), true);
  assert.equal(markup.includes('aria-label="AI 正在思考"'), true);
  assert.equal(markup.includes('data-typing-viewbox="0 0 100 700"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 700"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 800"'), false);
});

runCase("流式态在同一底部位置切换为 8 帧动画", () => {
  const markup = renderTypingLogo("streaming");

  assert.equal(markup.includes('data-typing-state="streaming"'), true);
  assert.equal(markup.includes('aria-label="AI 正在输出"'), true);
  assert.equal(markup.includes('data-typing-viewbox="0 0 100 800"'), true);
  assert.equal(markup.includes('viewBox="0 0 100 700"'), false);
  assert.equal(markup.includes('viewBox="0 0 100 800"'), true);
});

runCase("index.css 只保留 Tailwind 入口，不再承载 typing-logo 业务样式", () => {
  const css = fs.readFileSync(indexCssPath, "utf8");

  assert.equal(css.trim(), '@import "tailwindcss";');
  assert.equal(css.includes(".typing-logo"), false);
  assert.equal(css.includes(".streaming-logo {"), false);
});

console.log("All assertions passed.");
