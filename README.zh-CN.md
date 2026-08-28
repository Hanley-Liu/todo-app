# Todo App

> 一款轻量、零依赖的待办事项网页应用，基于 localStorage 持久化保存 — 添加、完成和删除任务，拥有干净且响应式的界面。

[![License: MIT](https://img.shields.io/github/license/Hanley-Liu/todo-app?color=blue&style=flat)](LICENSE)
[![Tests: 102 passing](https://img.shields.io/badge/Tests-102%20passing-brightgreen?style=flat)](tests/app.test.js)
[![CI](https://img.shields.io/github/actions/workflow/Hanley-Liu/todo-app/ci.yml?branch=main&label=CI&style=flat)](.github/workflows/ci.yml)
[![GitHub Stars](https://img.shields.io/github/stars/Hanley-Liu/todo-app?style=flat&color=gold)](https://github.com/Hanley-Liu/todo-app/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Hanley-Liu/todo-app?style=flat&color=lightgrey)](https://github.com/Hanley-Liu/todo-app/network)
[![No Dependencies](https://img.shields.io/badge/deps-0-brightgreen?style=flat)](#技术栈)
[![Built with Vanilla JS](https://img.shields.io/badge/built%20with-vanilla--js-orange?style=flat)](#技术栈)

---

## 功能特性

- **添加待办** — 输入任务后按回车或点击添加按钮
- **切换完成状态** — 点击复选框将事项标记为已完成 / 未完成
- **删除待办** — 点击任意事项的删除按钮移除
- **本地持久化** — 待办事项保存在 `localStorage`，页面刷新后依然保留
- **实时校验** — 空白和纯空格的输入会被拒绝，添加按钮会自动禁用
- **空状态提示** — 当列表为空时显示友好的 "No todos yet" 提示
- **响应式设计** — 适配手机和桌面屏幕
- **XSS 安全渲染** — 所有用户文本均通过 `textContent` 插入，绝不使用 `innerHTML`
- **优雅降级** — 当 `localStorage` 不可用（隐私模式）时，应用仍可在当前会话中正常运行
- **全面单元测试** — 依赖零外部库的测试运行器覆盖核心逻辑（运行 `node tests/app.test.js`）

---

## 快速开始

### 选项 1 — 直接打开

直接在浏览器中打开文件：

```
open index.html
```

> **注意：** 部分浏览器会限制通过 `file://` 协议访问 `localStorage`。如遇问题，请使用选项 2。

### 选项 2 — 启动本地 Web 服务器

```bash
# Python 3（内置）
python3 -m http.server 8000

# Node.js（一行命令）
npx serve .

# 或任意其他静态文件服务器
```

然后在浏览器中访问 [http://localhost:8000](http://localhost:8000)。

---

## 效果预览

> _效果图会放置在此处。_

|  |  |
|---|---|
| ![空状态](docs/assets/screenshot-empty.png) | ![待办列表](docs/assets/screenshot-active.png) |

*你可以用实际截图替换上述占位图，也欢迎提交 issue 来贡献效果图！*

---

## 技术栈

| 层级 | 技术 |
|-------|------|
| 标记 | HTML5 |
| 样式 | CSS3（无框架） |
| 逻辑 | 原生 JavaScript（ES5，无转译） |
| 持久化 | `localStorage`（JSON） |
| 测试 | Node.js 内置 `assert` 风格运行器（无外部依赖） |

**零依赖 · 无构建步骤 · 兼容所有现代浏览器。**

---

## 测试

项目附带一个自包含的测试套件，使用零外部依赖的轻量级测试运行器。无需 `npm install`。

```bash
node tests/app.test.js
```

共计 **102 个测试**，覆盖范围包括：

- `hasValidInput` — 输入校验（6 测试）
- `createTodo` — 待办创建与 ID 生成（3 测试）
- `addTodo` — 添加、去除首尾空格、不可变性（7 测试）
- `toggleTodo` — 完成状态切换（6 测试）
- `deleteTodo` — 删除、不可变性（5 测试）
- `editTodo` — 编辑、去除首尾空格、无效输入拒绝（9 测试）
- `filterTodos` — 全部/活跃/已完成过滤（7 测试)
- `clearCompleted` — 批量移除、不可变性（5 测试）
- `isValidTodo` — 类型与结构校验（8 测试）
- `sanitizeTodos` — 数组过滤（4 测试）
- `saveToLocalStorage` — 序列化与降级处理（5 测试）
- `loadFromLocalStorage` — 反序列化、损坏数据处理（6 测试）
- 持久化往返 — 保存 → 加载，状态完整性校验（3 测试）
- `generateId` — ID 唯一性与格式（2 测试）
- `createTodoElement` — DOM 元素创建（8 测试）
- `render` — 列表渲染与过滤可见性（4 测试）
- `updateAddButton` — 添加按钮启用/禁用状态（4 测试）
- `updateClearCompletedButton` — 清除已完成按钮可见性（6 测试）
- `render (empty state)` — 空状态消息（4 测试）

成功退出码为 `0`，失败为 `1`，便于集成到 CI 流水线。

---

## 项目结构

```
todo-app/
├── index.html              # 应用骨架 — 表单、输入框、待办列表容器
├── style.css               # 全部样式及响应式布局
├── app.js                  # 核心逻辑（纯函数 + DOM + 持久化）
├── tests/
│   └── app.test.js         # 零依赖单元测试套件（102 个测试）
├── discussion/
│   ├── product-requirements.md
│   ├── architecture.md
│   └── security-review.md
├── docs/
│   └── assets/             # 效果图、横幅
├── LICENSE
└── README.md
```

---

## 架构说明

`app.js` 将职责划分为三层：

1. **纯状态函数** — `addTodo`、`toggleTodo`、`deleteTodo`、`createTodo` 操作纯数组并返回新状态，不产生副作用或变更。
2. **持久化** — `saveToLocalStorage` 和 `loadFromLocalStorage` 负责 `localStorage` 的读写，并通过 `sanitizeTodos` / `isValidTodo` 进行健壮的错误处理与数据校验。
3. **渲染** — `render` 和 `createTodoElement` 仅使用 `textContent` 构建 DOM（绝不使用 `innerHTML`），从根本上保证 XSS 安全。

这种分层使得业务逻辑可以在 Node.js 环境中完全测试，而无需 DOM。

---

## 安全性

完整的安全审计请参见 [`discussion/security-review.md`](discussion/security-review.md)。概要如下：

- **XSS 安全**：用户文本仅通过 `textContent` 渲染；整个代码中没有 `innerHTML`、`document.write` 或 `eval`。
- **输入校验**：`hasValidInput` 在状态函数层面拒绝空白、纯空格和非字符串输入。
- **数据清洗**：`loadFromLocalStorage` 在使用前会通过 `isValidTodo` 校验并过滤每一项，确保被篡改或损坏的 `localStorage` 无法污染状态或崩溃渲染器。
- **弹性恢复**：所有 `localStorage` 访问都被包装在 try/catch 中，并在不可用时降级为内存存储。

**状态：通过 — 未发现任何安全漏洞。**

---

## 许可证

本项目采用 [MIT 许可证](LICENSE) 授权，你可以自由使用、修改和分发。

---

## 贡献

欢迎贡献！提交前请阅览 [`discussion/`](discussion/) 中的设计文档和安全审计报告。

1. Fork 本仓库
2. 创建特性分支（`git checkout -b feat/your-feature`）
3. 进行修改
4. 运行测试（`node tests/app.test.js`）
5. 提交 Pull Request
