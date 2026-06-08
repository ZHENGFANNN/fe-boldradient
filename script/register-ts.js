/** @format */

/**
 * 让 Node 构建脚本（`node ./script`）能 require `.ts` 模块。
 * 使用项目已有的 `typescript` devDependency 做即时转译，无需额外安装 tsx/ts-node。
 */
const fs = require("fs");
const Module = require("module");
const ts = require("typescript");

const TS_EXT = ".ts";

// 注意：Node 22+ 内置了 `.ts` 的原生 type-stripping 加载器，会预先占用
// `require.extensions[".ts"]`。原生 strip 只删类型、不做完整 CJS 转译，且
// 模块上下文下相对 `require(json)` 解析与预期不符（实测会静默失败），
// 因此这里**无条件覆盖**为项目 typescript 的完整转译，确保新旧 Node 行为一致。
// 旧逻辑用 `if (!require.extensions[TS_EXT])` 做守卫，在 Node 24 下守卫恒为
// false，导致自定义钩子从不注册 —— 这正是构建脚本读不到 globalConfig 的根因。
require.extensions[TS_EXT] = function compile(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2020,
      resolveJsonModule: true,
    },
    fileName: filename,
  });
  if (diagnostics?.length) {
    const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => "\n",
    });
    throw new Error(`TypeScript 转译失败: ${filename}\n${message}`);
  }
  module._compile(outputText, filename);
};

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveFilename(
  request,
  parent,
  isMain,
  options
) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;
    if (request.endsWith(TS_EXT) || request.endsWith(".js")) throw err;
    try {
      return originalResolveFilename.call(
        this,
        request + TS_EXT,
        parent,
        isMain,
        options
      );
    } catch {
      throw err;
    }
  }
};
