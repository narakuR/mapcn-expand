# Repository Guidelines

## Project Structure & Module Organization

本仓库是基于 Next.js App Router 的文档与示例站。主要代码位于 `src/`：

- `src/app/`：页面与路由，包含首页 `src/app/(home)` 和文档页 `src/app/docs`。
- `src/components/`：通用 React 组件，`src/components/ui` 放基础 UI。
- `src/lib/`：工具函数与地图能力，`src/lib/map-draw` 包含绘制模式与相关工具。
- `src/registry/`：对外暴露的注册表组件定义。
- `public/`：静态资源与生成后的注册表文件，如 `public/r/registry.json`。

## Build, Test, and Development Commands

- `npm install`：安装依赖。
- `npm run dev`：启动本地开发服务，默认用于文档与示例调试。
- `npm run build`：执行生产构建，提交前应至少跑一次。
- `npm run start`：本地启动生产构建结果。
- `npm run lint`：运行 ESLint 检查 Next.js 与 TypeScript 规则。
- `npm run registry:build`：重新生成 `public/r` 下的 shadcn registry 输出。
- `npx biome format --write .`：按仓库配置统一格式化代码。

## Coding Style & Naming Conventions

项目使用 TypeScript、React 19、Next.js 16。Biome 配置要求使用 Tab 缩进和双引号；ESLint 使用 `eslint-config-next`。新增代码应遵循：

- 组件文件使用小写短横线命名，如 `theme-toggle.tsx`。
- 导出 React 组件使用 PascalCase，工具函数使用 camelCase。
- 页面逻辑尽量靠近路由目录，通用能力放入 `src/components`、`src/lib` 或 `src/hooks`。

## Testing Guidelines

当前仓库未配置独立测试框架，也没有 `npm test` 脚本。提交变更前至少执行：

- `npm run lint`
- `npm run build`

如果新增复杂逻辑，优先补充可验证示例页，或在 PR 中写明手动验证步骤、访问路径和预期结果。

## Commit & Pull Request Guidelines

最近提交遵循简短祈使句风格，例如 `Update README.md`、`Adjust max-width in hero component`、`Add ... to devDependencies`。建议继续使用：

- 首行简洁描述单一变更。
- 避免把无关修改混入同一个提交。

PR 应包含变更摘要、影响范围、验证命令；涉及界面调整时，附上截图或录屏，并注明受影响页面，如 `/docs/installation`。

## Registry & Documentation Notes

修改注册表组件、安装命令或公开文档后，记得同步更新 `README.md`、`public/r/registry.json` 与相关文档页面，避免站点内容与 registry 输出不一致。
