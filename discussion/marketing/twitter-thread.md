# Twitter/X Launch Thread — Todo App

---

## Tweet 1/9

🚀 Just open-sourced my latest project: **Todo App**!

A lightweight, zero-dependency todo list web app built with only HTML5, CSS3, and vanilla JavaScript.

No frameworks. No build step. No npm install.

Let me show you what I built 👇

#JavaScript #WebDev #OpenSource #TodoApp

---

## Tweet 2/9

🔧 **Tech Stack**

• HTML5 (markup)
• CSS3 (no framework — pure CSS)
• Vanilla JS (ES5, no transpilation)
• localStorage (JSON persistence)
• Node.js assert-style test runner (zero deps)

One JS file. Zero dependencies. Works in any modern browser.

#VanillaJS #WebDevelopment

---

## Tweet 3/9

✨ **Key Features**

1️⃣ Add / Complete / Delete todos
2️⃣ localStorage persistence (survives reloads)
3️⃣ Responsive design (mobile + desktop)
4️⃣ Empty state UI
5️⃣ Real-time input validation
6️⃣ Graceful in-memory fallback (private mode)

All in a single `index.html` + `style.css` + `app.js`.

---

## Tweet 4/9

🛡️ **Security by Design**

• XSS-safe: all user text rendered via `textContent` — `innerHTML` is **never** used
• Input validation: rejects empty/whitespace-only/non-string input
• Data sanitization: every localStorage entry validated through `isValidTodo` before use
• All localStorage access wrapped in try/catch with fallback

Security isn't an afterthought — it's built in.

#WebSecurity #XSS

---

## Tweet 5/9

🧪 **Testing**

53 unit tests covering:
• Input validation (6 tests)
• Todo creation & ID generation (3)
• Adding, trimming, immutability (6)
• Completion toggling (5)
• Removal, immutability (5)
• Type/shape validation (8)
• Array filtering (4)
• localStorage save/load (8)
• Persistence round-trips (3)

Exit code 0 = all pass, 1 = any fail → CI-friendly.

#Testing #DevQuality

---

## Tweet 6/9

⚡ **Quickstart — under 10 seconds**

Option 1 — Open directly:
```bash
open index.html
```

Option 2 — Serve locally:
```bash
python3 -m http.server 8000
```

Visit http://localhost:8000

Zero setup. Zero dependencies.

#WebDev #QuickStart

---

## Tweet 7/9

📁 **Project Structure**

```
todo-app/
├── index.html          # App shell
├── style.css           # All styling
├── app.js              # Core logic
├── tests/
│   └── app.test.js     # 53 tests
├── docs/assets/        # Screenshots, banners
├── LICENSE             # MIT
└── README.md
```

Clean, simple, self-contained.

---

## Tweet 8/9

🗣️ **Architecture**

`app.js` separates three concerns:

1️⃣ Pure state functions — addTodo, toggleTodo, deleteTodo (no side effects)
2️⃣ Persistence — saveToLocalStorage / loadFromLocalStorage (with error handling)
3️⃣ Rendering — render / createTodoElement (textContent only, XSS-proof)

This makes the business logic fully testable in Node.js without a DOM.

---

## Tweet 9/9

🔗 **Get it on GitHub**

GitHub: https://github.com/Hanley-Liu/todo-app
License: MIT
Tests: `node tests/app.test.js` → 53 passed, 0 failed

First open-source release from a solo dev. Would love your feedback!

⭐ if you like it
🐛 open an issue if you find a bug
💬 comment below with feature ideas

#OpenSource #GitHub #TodoApp #VanillaJS