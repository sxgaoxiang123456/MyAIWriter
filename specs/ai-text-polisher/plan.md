# AI Text Polisher — Implementation Plan

> 严格遵循 Constitution v1.0.0 生成，所有技术决策均对照约束校验。

---

## 1. 技术栈与依赖

### 生产依赖

| 包 | 版本约束 | 用途 |
|----|----------|------|
| `react` | ^19.0.0 | UI 框架 |
| `react-dom` | ^19.0.0 | DOM 渲染 |

### 开发依赖

| 包 | 版本约束 | 用途 |
|----|----------|------|
| `vite` | ^6.x | 构建工具 + dev server proxy |
| `@vitejs/plugin-react` | ^4.x | React Fast Refresh |
| `typescript` | ^5.x | 类型系统，strict 模式 |
| `@types/react` | ^19.x | React 类型定义 |
| `@types/react-dom` | ^19.x | ReactDOM 类型定义 |
| `tailwindcss` | ^4.x | 原子 CSS 样式 |
| `@tailwindcss/vite` | ^4.x | Tailwind v4 Vite 插件 |

> **无任何额外 UI 框架、路由库、状态管理库。** 符合 Constitution I、III。

---

## 2. 项目文件结构

```
MyAIWriter/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.local                          # VITE_DEEPSEEK_API_KEY=sk-...（不入 git）
├── .gitignore
└── src/
    ├── main.tsx                        # 应用入口
    ├── App.tsx                         # 根组件，持有全局 state
    ├── types/
    │   └── index.ts                    # 所有 TS 类型定义
    ├── config/
    │   └── scenes.ts                   # 6 个场景配置 + prompt 模板
    ├── api/
    │   └── deepseek.ts                 # DeepSeek API 调用，唯一 fetch 出口
    └── components/
        ├── SceneSelector.tsx           # 顶部场景选择栏
        ├── TextInput.tsx               # 左侧输入区（含字符计数 + 清空）
        ├── PolishButton.tsx            # 润色按钮
        ├── ResultPanel.tsx             # 右侧结果展示区
        └── CopyButton.tsx              # 一键复制按钮
```

> 目录仅含 `components/` `api/` `config/` `types/`，符合 Constitution III。

---

## 3. 类型定义（`src/types/index.ts`）

```typescript
// 场景唯一标识
export type SceneKey =
  | 'academic'
  | 'business_email'
  | 'social_media'
  | 'tech_doc'
  | 'creative'
  | 'translation';

// 单个场景配置
export interface Scene {
  key: SceneKey;
  label: string;           // UI 显示名称
  systemPrompt: string;    // 发给 DeepSeek 的 system 消息
}

// 润色请求参数
export interface PolishRequest {
  text: string;
  scene: SceneKey;
}

// 润色响应
export interface PolishResponse {
  result: string;
}

// API 层统一错误
export interface ApiError {
  message: string;         // 用户可读的友好提示
}

// 结果区域状态
export type ResultState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; text: string }
  | { status: 'error'; message: string };
```

---

## 4. 场景配置（`src/config/scenes.ts`）

每个场景包含：`key`、`label`、`systemPrompt`。prompt 在此集中定义，UI 组件只读取，不内联任何 prompt 字符串。

```typescript
import type { Scene } from '../types';

export const SCENES: Scene[] = [
  {
    key: 'academic',
    label: '学术润色',
    systemPrompt:
      'You are an academic writing assistant. Rewrite the following text in a formal academic tone. ' +
      'Remove colloquialisms and casual expressions while preserving the original meaning exactly. ' +
      'Do not add new content or change the factual claims.',
  },
  {
    key: 'business_email',
    label: '商务邮件',
    systemPrompt:
      'You are a professional business writing assistant. Rewrite the following text as a polished business email. ' +
      'Use a professional tone, ensure the structure is clear, include an appropriate greeting at the start ' +
      'and a courteous closing at the end.',
  },
  {
    key: 'social_media',
    label: '社交媒体',
    systemPrompt:
      'You are a social media copywriter. Rewrite the following text in a lively, engaging tone suitable for social media. ' +
      'You may add relevant emojis where appropriate. Keep the output within 280 characters.',
  },
  {
    key: 'tech_doc',
    label: '技术文档',
    systemPrompt:
      'You are a technical documentation specialist. Rewrite the following text as precise technical documentation. ' +
      'Use accurate terminology, prefer passive voice, number sequential steps, and preserve any code formatting exactly as-is.',
  },
  {
    key: 'creative',
    label: '创意写作',
    systemPrompt:
      'You are a creative writing assistant. Rewrite the following text with literary flair. ' +
      'Use metaphors, parallelism, and personification to make the text vivid and expressive.',
  },
  {
    key: 'translation',
    label: '翻译优化',
    systemPrompt:
      'You are a professional translator and language polisher. ' +
      'If the input is Chinese, translate it into natural, idiomatic English — not a word-for-word translation. ' +
      'If the input is English, translate it into fluent, natural Chinese. ' +
      'Focus on conveying meaning naturally rather than literal translation.',
  },
];

export const DEFAULT_SCENE_KEY: SceneKey = 'academic';
```

> prompt 全部集中于此文件，UI 组件零 prompt 内联。符合 Constitution II、IV。

---

## 5. API 层（`src/api/deepseek.ts`）

- 唯一调用 `fetch` 的文件
- 使用 Vite proxy `/api/` 前缀，开发时转发至 `https://api.deepseek.com/`
- API Key 从 `import.meta.env.VITE_DEEPSEEK_API_KEY` 读取
- 封装友好错误，不抛出原始 HTTP 错误

```typescript
import type { PolishRequest, PolishResponse } from '../types';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string;
const ENDPOINT = '/api/chat/completions';   // Vite proxy 转发
const MODEL = 'deepseek-chat';

export async function polishText(
  req: PolishRequest,
  systemPrompt: string,
): Promise<PolishResponse> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: req.text },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('API_ERROR');   // 上层捕获并转换为友好提示
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const result = data.choices[0]?.message?.content ?? '';
  return { result };
}
```

> 无硬编码 Key，模型固定 `deepseek-chat`。符合 Constitution V。

---

## 6. Vite 配置（`vite.config.ts`）

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

---

## 7. TypeScript 配置（`tsconfig.json`）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

> `strict: true` + `noImplicitReturns`，全面阻断 `any`。符合 Constitution IV。

---

## 8. 状态管理（`src/App.tsx`）

纯 `useState`，无任何外部状态库：

```
inputText: string           // 输入框文本
selectedScene: SceneKey     // 当前选中场景（默认 'academic'）
resultState: ResultState    // idle | loading | success | error
```

事件流：
1. 用户输入 → `setInputText`
2. 用户选场景 → `setSelectedScene`
3. 点击润色 → `setResultState({ status: 'loading' })` → 调用 `polishText()` → 成功 `success` / 失败 `error`
4. 点击清空 → `setInputText('')` + `setResultState({ status: 'idle' })`

---

## 9. 组件职责说明

### `SceneSelector`
- Props：`scenes: Scene[]`、`selected: SceneKey`、`onChange: (key: SceneKey) => void`
- 渲染 6 个按钮，选中态有视觉区分（Tailwind 条件类）
- 不含任何 prompt 逻辑

### `TextInput`
- Props：`value: string`、`onChange: (v: string) => void`、`onClear: () => void`、`maxLength: number`
- 渲染 `<textarea>` + 字符计数（超限变红）+ 清空按钮
- 计数逻辑：`value.length / maxLength`，超过 3000 时计数文字变红

### `PolishButton`
- Props：`disabled: boolean`、`loading: boolean`、`onClick: () => void`
- 禁用条件（从 App 传入已计算好的 `disabled`）：空文本 || 超长 || loading
- loading 时显示旋转图标 + "润色中..."

### `ResultPanel`
- Props：`state: ResultState`
- 根据 `state.status` 分支渲染：
  - `idle`：空态提示（"润色结果将在此显示"）
  - `loading`：旋转动画 + "润色中..."
  - `success`：只读文本区域 + `CopyButton`
  - `error`：友好错误文字（红色提示区）

### `CopyButton`
- Props：`text: string`
- 内部持有 `copied: boolean` state（局部，2 秒后自动重置）
- 调用 `navigator.clipboard.writeText()`

---

## 10. 错误处理策略

| 错误类型 | 触发条件 | 用户提示 |
|----------|----------|----------|
| 网络不可达 | `fetch` 抛出 TypeError | "网络连接失败，请检查网络后重试" |
| API 非 2xx | `response.ok === false` | "润色服务暂时不可用，请稍后再试" |
| 响应格式异常 | `choices[0]` 不存在 | "收到异常响应，请重试" |

所有错误均在 `deepseek.ts` 捕获并统一转换，上层组件只消费 `ResultState.error.message`。

---

## 11. 样式规范

- 全量使用 Tailwind v4 原子类，零自定义 CSS 文件（除 `src/index.css` 仅含 `@import "tailwindcss"`）
- 布局：顶部场景栏 + 下方两列（输入 / 结果）+ 中间润色按钮区
- 响应式：`md:grid-cols-2` 双列，移动端单列堆叠
- 超限计数器：`text-red-500` 条件类
- 选中场景按钮：`bg-blue-600 text-white` vs `bg-gray-100 text-gray-700`
- 错误提示区：`bg-red-50 border border-red-200 text-red-700`

---

## 12. 环境变量

```
# .env.local（本地，不入 git）
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

`.gitignore` 必须包含 `.env.local`。

---

## 13. 大模型应用配置汇总

| 配置项 | 值 |
|--------|----|
| 模型 | `deepseek-chat` |
| API Base URL | `https://api.deepseek.com`（经 Vite proxy） |
| 鉴权方式 | `Authorization: Bearer ${VITE_DEEPSEEK_API_KEY}` |
| 接口路径 | `POST /chat/completions` |
| messages 结构 | `[{ role: 'system', content: systemPrompt }, { role: 'user', content: inputText }]` |
| temperature | 不传（使用模型默认） |
| max_tokens | 不传（使用模型默认，够用） |
| stream | `false`（非流式，等待完整响应） |

---

**Version**: 1.0.0 | **Created**: 2026-04-16
