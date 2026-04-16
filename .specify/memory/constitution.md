# AI Text Polisher Constitution

## 项目定位

AI Text Polisher 是一个纯前端文本润色工具。用户粘贴一段文字、选择润色场景，DeepSeek 返回润色结果。仅此一件事。

**不做什么**：不是 CMS，不是协作平台，不处理敏感数据，无需注册登录。

---

## Core Principles

### I. 技术栈锁定

技术栈由人工确定，AI 不得自行替换或建议替换以下选型：

- **框架**：React 19 + TypeScript 严格模式（`strict: true`）
- **构建工具**：Vite
- **样式**：Tailwind CSS v4 原子类

**禁止引入**：
- 任何 CSS 组件框架（MUI、Ant Design、Chakra UI 及同类）
- CSS Modules
- styled-components 或任何 CSS-in-JS 方案

> 原因：Tailwind 原子类已完全覆盖本项目所有样式需求。额外框架只增加打包体积，且风格无法统一。这是硬约束，不可协商。

---

### II. 代码复用规范

- 同一 UI 模式出现 **两次或以上**，必须抽取为独立组件
- 所有 API 调用统一放在 `src/api/` 目录，**组件内禁止直接调用 fetch 或任何 HTTP 方法**
- 6 个润色场景的 prompt 模板统一放在 `src/config/`，**不得散落在组件代码中**

---

### III. 项目结构约束

允许的 `src/` 子目录仅限以下四个，**不得额外创建**：

```
src/
  components/   # UI 组件
  api/          # DeepSeek 接口调用
  config/       # 场景 prompt 配置
  types/        # TypeScript 类型定义
```

**禁止引入**：
- 路由库（项目只有一个页面，不需要路由）
- Redux、Zustand、Jotai 或任何外部状态管理库（`useState` 已够用）

> 原因：对一个单页小型 SPA 而言，引入这些只增加心智负担，没有任何实质收益。

---

### IV. 代码质量要求

以下为强制执行项，不可妥协：

- TypeScript 严格模式全程开启，**代码中禁止出现 `any`**
- 一个组件对应一个文件，**禁止在单文件中 export 多个组件**
- prompt 配置与 UI 组件**完全解耦**——修改场景配置不应触碰任何 UI 代码

---

### V. DeepSeek 接口规范

- 模型固定使用 `deepseek-chat`，不得更换
- 开发环境通过 Vite proxy 解决 CORS 问题：`/api/*` 转发至 `https://api.deepseek.com/*`
- API Key 从环境变量 `VITE_DEEPSEEK_API_KEY` 读取，**禁止硬编码写入任何代码文件**

---

## Governance

本 constitution 是项目最高级别约束文件，优先级高于所有其他开发约定。

- 所有代码生成、代码审查、功能实现均须对照本 constitution 逐条校验
- 任何修改 constitution 的提案须附说明变更原因，并更新版本号和日期
- 若某条约束在实际执行中产生明显阻碍，应先讨论后修订，不得绕过执行

**Version**: 1.0.0 | **Ratified**: 2026-04-16 | **Last Amended**: 2026-04-16
