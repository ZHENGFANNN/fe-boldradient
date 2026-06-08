/** @format */

/**
 * 让 Node 构建脚本（`node ./script`）能 require `.ts` 模块。
 * 使用项目已有的 `typescript` devDependency 做即时转译，无需额外安装 tsx/ts-node。
 */
const fs = require("fs");
const Module = require("module");
const ts = require("typescript");

const TS_EXT = ".ts";

if (!require.extensions[TS_EXT]) {
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
}

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
