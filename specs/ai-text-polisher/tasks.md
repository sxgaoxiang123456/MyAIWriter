# AI Text Polisher — Task Breakdown

> 依赖顺序排列，每个 Phase 末尾用 `npm run build` 验证，Phase 5 起 dev server 联调。

---

## Phase 1 · 项目脚手架与配置

- [x] T01 · 初始化项目结构
  - 在项目根目录执行 `npm create vite@latest . -- --template react-ts`（覆盖当前目录）
  - 删除 Vite 模板自动生成的无关文件：`src/assets/`、`src/App.css`、`public/vite.svg`
  - 产出：`package.json`、`index.html`、`src/main.tsx`、`src/App.tsx`（空壳）

- [x] T02 · 安装依赖
  - 生产依赖：`npm install react@^19 react-dom@^19`
  - 开发依赖：`npm install -D tailwindcss@^4 @tailwindcss/vite@^4`
  - 确认 `package.json` 中无 MUI / Ant Design / Chakra / react-router / zustand / redux / jotai
  - 产出：`node_modules/` + 锁定的 `package-lock.json`

- [x] T03 · 配置 `vite.config.ts`
  - plugins：`[react(), tailwindcss()]`（`@tailwindcss/vite` 插件）
  - server.proxy：
    ```
    '/api': {
      target: 'https://api.deepseek.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
    ```
  - 产出：`vite.config.ts`（完整内容，无占位符）

- [x] T04 · 配置 `tsconfig.json`
  - `compilerOptions.strict: true`
  - `noUnusedLocals: true`、`noUnusedParameters: true`、`noImplicitReturns: true`
  - `target: "ES2020"`、`moduleResolution: "bundler"`、`jsx: "react-jsx"`
  - 产出：`tsconfig.json`（严格模式全开）

- [x] T05 · 配置 Tailwind CSS
  - `src/index.css` 内容仅为 `@import "tailwindcss";`，无其他自定义样式
  - `src/main.tsx` 顶部 `import './index.css'`
  - 产出：`src/index.css`（1 行）

- [x] T06 · 配置环境变量与 `.gitignore`
  - 创建 `.env.local`，内容：`VITE_DEEPSEEK_API_KEY=sk-placeholder`（占位，不填真实 Key）
  - `.gitignore` 确保包含：`.env.local`、`node_modules/`、`dist/`
  - 产出：`.env.local`、`.gitignore`

- [x] T07 · 创建四个 `src/` 子目录
  - `src/types/`、`src/config/`、`src/api/`、`src/components/`
  - 每个目录放一个 `.gitkeep` 或直接创建对应文件（下一 Phase 填充）
  - 产出：四个目录存在，符合 Constitution III 结构约束

- [x] T08 · Phase 1 验证
  - 运行 `npm run build`
  - 期望：构建成功，无 TS 报错，`dist/` 生成
  - 若失败：检查 tsconfig / vite 插件配置

---

## Phase 2 · 类型定义与配置数据层

- [x] T09 · 实现 `src/types/index.ts`
  - 导出以下类型（完整，无 `any`）：
    - `SceneKey`（6 个字面量联合类型）
    - `Scene`（`key`、`label`、`systemPrompt`）
    - `PolishRequest`（`text`、`scene`）
    - `PolishResponse`（`result`）
    - `ApiError`（`message`）
    - `ResultState`（判别联合：`idle` | `loading` | `success` | `error`）
  - 产出：`src/types/index.ts`（仅类型，无运行时代码）

- [x] T10 · 实现 `src/config/scenes.ts`
  - 导出 `SCENES: Scene[]`，包含全部 6 个场景配置，每个场景含：
    - `key`：`academic` / `business_email` / `social_media` / `tech_doc` / `creative` / `translation`
    - `label`：学术润色 / 商务邮件 / 社交媒体 / 技术文档 / 创意写作 / 翻译优化
    - `systemPrompt`：按 plan.md §4 所列内容逐字实现
  - 导出 `DEFAULT_SCENE_KEY: SceneKey = 'academic'`
  - 文件内无任何 UI 代码、无 React import
  - 产出：`src/config/scenes.ts`

- [x] T11 · Phase 2 验证
  - 运行 `npm run build`
  - 期望：`types/` 和 `config/` 模块无类型错误

---

## Phase 3 · API 层

- [x] T12 · 实现 `src/api/deepseek.ts`
  - 常量定义：
    - `API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string`（不硬编码）
    - `ENDPOINT = '/api/chat/completions'`（Vite proxy 路径）
    - `MODEL = 'deepseek-chat'`（固定，不可参数化）
  - 导出 `polishText(req: PolishRequest, systemPrompt: string): Promise<PolishResponse>`
  - 请求体结构：
    ```json
    {
      "model": "deepseek-chat",
      "messages": [
        { "role": "system", "content": "<systemPrompt>" },
        { "role": "user", "content": "<req.text>" }
      ]
    }
    ```
  - 错误处理（三类，均在此文件内捕获，不向上抛原始错误）：
    - `fetch` 抛出 TypeError → 抛出 `Error('网络连接失败，请检查网络后重试')`
    - `response.ok === false` → 抛出 `Error('润色服务暂时不可用，请稍后再试')`
    - `choices[0]` 不存在 → 抛出 `Error('收到异常响应，请重试')`
  - 文件内无直接 DOM 操作、无 React import
  - 产出：`src/api/deepseek.ts`

- [x] T13 · Phase 3 验证
  - 运行 `npm run build`
  - 期望：`api/deepseek.ts` 无类型错误，`VITE_DEEPSEEK_API_KEY` env var 正确引用

---

## Phase 4 · UI 组件层

> 每个组件独立一文件，一文件只 export 一个组件。

- [x] T14 · 实现 `src/components/SceneSelector.tsx`
  - Props 类型（inline interface，无 any）：
    - `scenes: Scene[]`
    - `selected: SceneKey`
    - `onChange: (key: SceneKey) => void`
  - 渲染 6 个 `<button>`，选中态：`bg-blue-600 text-white`，未选中：`bg-gray-100 text-gray-700`
  - 不含任何 prompt 字符串或 API 调用
  - 产出：`src/components/SceneSelector.tsx`

- [x] T15 · 实现 `src/components/TextInput.tsx`
  - Props：`value: string`、`onChange: (v: string) => void`、`onClear: () => void`、`maxLength: number`
  - 渲染 `<textarea>` + 字符计数（`value.length / maxLength`）
  - 超过 `maxLength` 时计数文字应用 `text-red-500`，未超限时 `text-gray-400`
  - 清空按钮：点击调用 `onClear()`
  - 产出：`src/components/TextInput.tsx`

- [x] T16 · 实现 `src/components/CopyButton.tsx`
  - Props：`text: string`
  - 内部 state：`copied: boolean`（初始 `false`）
  - 点击调用 `navigator.clipboard.writeText(text)`，成功后 `setCopied(true)`
  - `useEffect` 或 `setTimeout`：2000ms 后 `setCopied(false)`
  - 按钮文字：未复制显示"复制"，已复制显示"已复制 ✓"
  - 产出：`src/components/CopyButton.tsx`

- [x] T17 · 实现 `src/components/PolishButton.tsx`
  - Props：`disabled: boolean`、`loading: boolean`、`onClick: () => void`
  - `loading` 为 `true` 时：显示旋转图标（Tailwind `animate-spin`）+ "润色中..."，按钮 `disabled`
  - `disabled` 为 `true` 时：`opacity-50 cursor-not-allowed`
  - 正常态：`bg-blue-600 hover:bg-blue-700 text-white`
  - 产出：`src/components/PolishButton.tsx`

- [x] T18 · 实现 `src/components/ResultPanel.tsx`
  - Props：`state: ResultState`
  - 根据 `state.status` 分支渲染（穷举判别联合，TypeScript 确保全覆盖）：
    - `idle`：灰色占位文字"润色结果将在此显示"
    - `loading`：`animate-spin` 图标 + "润色中..."
    - `success`：只读 `<textarea>` 展示 `state.text` + `<CopyButton text={state.text} />`
    - `error`：`bg-red-50 border border-red-200 text-red-700` 区块展示 `state.message`
  - `CopyButton` 仅在 `success` 状态下渲染
  - 产出：`src/components/ResultPanel.tsx`

- [x] T19 · Phase 4 验证
  - 运行 `npm run build`
  - 期望：所有组件 TS 类型无错误，build 成功

---

## Phase 5 · 应用组装与联调

- [x] T20 · 实现 `src/App.tsx`
  - State（纯 `useState`，无外部库）：
    - `inputText: string`（初始 `''`）
    - `selectedScene: SceneKey`（初始 `DEFAULT_SCENE_KEY`，来自 `config/scenes`）
    - `resultState: ResultState`（初始 `{ status: 'idle' }`）
  - 计算属性（非 state，直接计算）：
    - `isOverLimit: boolean = inputText.length > 3000`
    - `isPolishDisabled: boolean = inputText.trim() === '' || isOverLimit || resultState.status === 'loading'`
  - `handlePolish` 函数：
    1. `setResultState({ status: 'loading' })`
    2. 找到当前场景的 `systemPrompt`（从 `SCENES` 中 find）
    3. 调用 `polishText({ text: inputText, scene: selectedScene }, systemPrompt)`
    4. 成功：`setResultState({ status: 'success', text: response.result })`
    5. 捕获错误：`setResultState({ status: 'error', message: err.message })`
  - `handleClear` 函数：`setInputText('')` + `setResultState({ status: 'idle' })`
  - 布局结构（Tailwind）：
    ```
    <div> (min-h-screen bg-gray-50)
      <header> (场景选择栏 - SceneSelector)
      <main> (两列 grid: md:grid-cols-2, 单列移动端)
        左列: <TextInput> + <PolishButton>
        右列: <ResultPanel>
    ```
  - 产出：`src/App.tsx`

- [x] T21 · 实现 `src/main.tsx`
  - `ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`
  - 顶部 `import './index.css'`
  - 产出：`src/main.tsx`（完整，无 StrictMode 争议——可保留 `<StrictMode>`）

- [x] T22 · Phase 5 build 验证
  - 运行 `npm run build`
  - 期望：完整应用编译通过，dist/ 体积合理

- [x] T23 · Phase 5 dev 联调
  - 在 `.env.local` 填入真实 `VITE_DEEPSEEK_API_KEY`
  - 运行 `npm run dev`，浏览器打开本地地址
  - 执行手动验收：
    - [x] 6 个场景可切换，选中态视觉正确
    - [x] 输入超 3000 字，计数器变红，润色按钮禁用
    - [x] 点击润色，右侧显示"润色中..."动画
    - [x] 润色结果正确展示，可滚动
    - [x] 复制按钮写入剪贴板，2 秒后文字恢复
    - [x] 清空输入，结果区同步清空，场景不变
    - [x] 断网时点击润色，显示友好错误提示

---

## Constraint Checks（Constitution v1.0.0 验收）

> 交付前逐项确认，全部打勾方可视为完成。

- [x] **C01 · 技术栈**：`package.json` 生产依赖仅含 `react`、`react-dom`，无 MUI / Ant Design / Chakra 或其他 CSS 框架
- [x] **C02 · 样式**：`src/` 下无 `.module.css` 文件，无 styled-components import，仅使用 Tailwind 原子类
- [x] **C03 · 组件复用**：`SceneSelector`、`CopyButton` 等重复出现的 UI 模式均已抽组件，App.tsx 无内联重复 UI 块
- [x] **C04 · API 集中**：`grep -r "fetch(" src/` 结果仅出现在 `src/api/deepseek.ts`，组件目录无 fetch 调用
- [x] **C05 · Prompt 集中**：`grep -r "You are" src/` 结果仅出现在 `src/config/scenes.ts`，组件和 api 目录无 prompt 字符串
- [x] **C06 · 目录结构**：`src/` 下仅含 `components/`、`api/`、`config/`、`types/`（及根文件），无额外目录
- [x] **C07 · 无路由库**：`package.json` 无 react-router / tanstack-router 或任何路由依赖
- [x] **C08 · 无状态管理库**：`package.json` 无 redux / zustand / jotai / recoil 或任何外部状态库
- [x] **C09 · TypeScript 严格**：`npx tsc --noEmit` 零错误零警告，代码中 `grep -r ": any" src/` 无结果
- [x] **C10 · 一组件一文件**：`src/components/` 下每个 `.tsx` 文件仅有一个 `export default`，无具名组件多导出

---

**Version**: 1.0.0 | **Created**: 2026-04-16
