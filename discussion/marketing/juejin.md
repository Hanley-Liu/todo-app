# 掘金文章 — Todo App 开源发布

## 标题

🚀 开源发布：Todo App — 零依赖、Vanilla JS + localStorage 的 Todo 应用，附 53 个单元测试

---

## 导言

这是我最近完成的一个小项目 — **Todo App**，一个极简的 Todo 应用。

它完全基于 **HTML5 + CSS3 + 原生 JavaScript (ES5)** 构建，**零第三方依赖，零构建步骤**，
只需在浏览器中打开 `index.html` 即可使用。

为什么要做这个项目？因为我想证明：只需要原生 Web 技术，就能构建一个功能完整、安全可靠、
且具备自动化测试覆盖率的单页应用。

---

## 核心功能

| 功能 | 说明 |
|---|---|
| **添加 / 完成 / 删除** | 支持回车确认和点击按钮操作 |
| **localStorage 持久化** | 刷新页面后待办事项自动保存恢复 |
| **响应式设计** | 适配移动端和桌面端 |
| **空状态提示** | 当列表为空时显示友好提示 |
| **实时输入校验** | 拒绝空白/空格输入，按钮自动禁用 |
| **优雅降级** | 当 localStorage 不可用（如隐身模式），应用仍可运行（内存模式） |

---

## 技术方案

| 层级 | 技术选型 |
|---|---|
|  markup | HTML5 |
| 样式 | CSS3 (无框架) |
| 逻辑 | 原生 JavaScript (ES5，无转译) |
| 持久化 | localStorage (JSON 格式) |
| 测试 | Node.js 内置 assert 风格运行器 (零依赖) |

> **零依赖 · 零构建 · 任意现代浏览器即可运行**

---

## 安全设计

- **XSS 防护**：所有用户文本通过 `textContent` 渲染，**绝不使用 `innerHTML`**
- **输入验证**：`hasValidInput` 拒绝空字符串、纯空格和非字符串输入
- **数据校验**：`loadFromLocalStorage` 对每一条数据都通过 `isValidTodo` 过滤，防篡改
- **容错处理**：所有 `localStorage` 操作都被 `try/catch` 包裹，有降级策略

> 安全并非一个模块，而是贯穿整个应用的设计原则。

---

## 测试

测试采用零依赖的自定义测试运行器（基于 Node.js `assert`），运行命令：

```bash
node tests/app.test.js
```

当前共 **53 个测试用例**，全部通过，覆盖范围：

- `hasValidInput` — 输入校验 (6 个)
- `createTodo` — 创建 & ID 生成 (3 个)
- `addTodo` — 添加、去重、不可变性 (6 个)
- `toggleTodo` — 完成状态切换 (5 个)
- `deleteTodo` — 删除、不可变性 (5 个)
- `isValidTodo` — 类型/结构校验 (8 个)
- `sanitizeTodos` — 数组过滤 (4 个)
- `saveToLocalStorage` — 序列化 & 降级 (4 个)
- `loadFromLocalStorage` — 反序列化、异常处理 (6 个)
- 持久化往返 — 保存→加载的完整性校验 (3 个)

> 出口码为 0 表示全部通过，1 表示有失败，CI 友好。

---

## 架构说明

`app.js` 将职责划分为三层：

1. **纯状态函数** — `addTodo`、`toggleTodo`、`deleteTodo`、`createTodo`
   操作纯数组，返回新状态，不产生副作用，不进行任何 I/O。
2. **持久化层** — `saveToLocalStorage`、`loadFromLocalStorage`
   处理 localStorage 读写，包含健壮的错误处理与数据清洗。
3. **渲染层** — `render`、`createTodoElement`
   仅使用 `textContent` 构建 DOM，保证 XSS 安全。

这种分层使得业务逻辑可以在 Node.js 环境下**无需 DOM 即可被完整测试**。

---

## 快速体验

### 方式一：直接打开

```bash
open index.html
```

> ⚠️ 提示：部分浏览器会限制 `file://` 协议下的 `localStorage`，建议使用方式二。

### 方式二：本地服务器

```bash
python3 -m http.server 8000
```

在浏览器中访问：[http://localhost:8000](http://localhost:8000)

---

## 项目链接

- **GitHub 仓库**：[https://github.com/Hanley-Liu/todo-app](https://github.com/Hanley-Liu/todo-app)
- **许可证**：MIT License
- **运行测试**：`node tests/app.test.js`

---

## 致谢 & 展望

这是我作为独立开发者发布的第一个开源项目。如果你觉得不错，请给个 ⭐ Star 支持一下！

欢迎提出 Issue 或提交 PR，一起完善这个项目。

未来可能的方向：

- 添加标签 / 截止日期功能
- 添加键盘快捷键
- 添加深色模式

期待你的想法和建议！ 🙏

---

* — Hanley-Liu, 2026 年 8 月*