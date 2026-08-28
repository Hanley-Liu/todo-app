# Todo App

> A lightweight, zero-dependency todo list web app with localStorage persistence — add, complete, delete, edit, and filter tasks in a clean, responsive interface.

[![License: MIT](https://img.shields.io/github/license/Hanley-Liu/todo-app?color=blue&style=flat)](LICENSE)
[![Tests: 102 passing](https://img.shields.io/badge/Tests-102%20passing-brightgreen?style=flat)](tests/app.test.js)
[![CI](https://img.shields.io/github/actions/workflow/Hanley-Liu/todo-app/ci.yml?branch=main&label=CI&style=flat)](.github/workflows/ci.yml)
[![GitHub Stars](https://img.shields.io/github/stars/Hanley-Liu/todo-app?style=flat&color=gold)](https://github.com/Hanley-Liu/todo-app/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Hanley-Liu/todo-app?style=flat&color=lightgrey)](https://github.com/Hanley-Liu/todo-app/network)
[![No Dependencies](https://img.shields.io/badge/deps-0-brightgreen?style=flat)](#tech-stack)
[![Built with Vanilla JS](https://img.shields.io/badge/built%20with-vanilla--js-orange?style=flat)](#tech-stack)

---

## Features

- **Add todos** — type a task and hit Enter or the Add button
- **Toggle complete** — click the checkbox to mark items done / undone
- **Delete todos** — remove any item with its Delete button
- **Edit todos** — click the Edit button to modify an existing task
- **Filter views** — switch between All, Active, and Completed filters
- **Clear completed** — one-click removal of all completed items
- **Persistent storage** — todos are saved to `localStorage` and survive page reloads
- **Real-time validation** — empty and whitespace-only input is rejected; the Add button disables automatically
- **Empty state** — a friendly "No todos yet" message appears when the list is empty
- **Responsive design** — adapts to mobile and desktop screens
- **XSS-safe rendering** — all user text is inserted via `textContent`; `innerHTML` is never used
- **Graceful degradation** — when `localStorage` is unavailable (private mode), the app keeps working in-memory for the session
- **102 unit tests** — a dependency-free test runner covers the core logic (run `node tests/app.test.js`)

---

## Quickstart

### Option 1 — Open directly

Just open the file in your browser:

```
open index.html
```

> **Note:** Some browsers restrict `localStorage` when opening a file via `file://`. If you run into issues, use Option 2.

### Option 2 — Serve with a local web server

```bash
# Python 3 (built-in)
python3 -m http.server 8000

# Node.js (one-liner)
npx serve .

# Or any static server of your choice
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.

---

## Screenshots

> _Screenshots will be added here._

|  |  |
|---|---|
| ![Empty state](docs/assets/screenshot-empty.png) | ![With todos](docs/assets/screenshot-active.png) |

*Feel free to replace the placeholders above with real screenshots or open an issue to contribute them!*

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (no framework) |
| Logic | Vanilla JavaScript (ES5, no transpilation) |
| Persistence | `localStorage` (JSON) |
| Testing | Node.js built-in `assert`-style runner (no external deps) |

**Zero dependencies. No build step. Works in any modern browser.**

---

## Testing

The project ships with a self-contained test suite using a minimal, dependency-free test runner. No npm install required.

```bash
node tests/app.test.js
```

This runs **102 tests** covering:

- `hasValidInput` — input validation (6 tests)
- `createTodo` — todo creation & ID generation (3 tests)
- `addTodo` — adding, trimming, immutability (7 tests)
- `toggleTodo` — completion toggling (6 tests)
- `deleteTodo` — removal, immutability (5 tests)
- `editTodo` — editing, trimming, invalid input rejection (9 tests)
- `filterTodos` — all/active/completed filtering (7 tests)
- `clearCompleted` — bulk removal, immutability (5 tests)
- `isValidTodo` — type/shape validation (8 tests)
- `sanitizeTodos` — array filtering (4 tests)
- `saveToLocalStorage` — serialization & degradation (5 tests)
- `loadFromLocalStorage` — deserialization, corrupt data handling (6 tests)
- Persistence round-trips — save → load with state integrity (3 tests)
- `generateId` — ID uniqueness & format (2 tests)
- `createTodoElement` — DOM element creation (8 tests)
- `render` — list rendering & filter visibility (4 tests)
- `updateAddButton` — add button enable/disable state (4 tests)
- `updateClearCompletedButton` — clear-completed button visibility (6 tests)
- `render (empty state)` — empty state messages (4 tests)

Exit code is `0` on success and `1` on any failure, making it CI-friendly.

---

## Project Structure

```
todo-app/
├── index.html              # App shell — form, input, list container
├── style.css               # All styling + responsive layout
├── app.js                  # Core logic (pure functions + DOM + persistence)
├── tests/
│   └── app.test.js         # Dependency-free unit test suite (102 tests)
├── discussion/
│   ├── product-requirements.md
│   ├── architecture.md
│   └── security-review.md
├── docs/
│   └── assets/             # Screenshots, banners
├── LICENSE
└── README.md
```

---

## Architecture Notes

The `app.js` module separates three concerns:

1. **Pure state functions** — `addTodo`, `toggleTodo`, `deleteTodo`, `createTodo` operate on plain arrays and return new state without mutation or side effects.
2. **Persistence** — `saveToLocalStorage` and `loadFromLocalStorage` handle `localStorage` I/O with robust error handling and data sanitization via `sanitizeTodos` / `isValidTodo`.
3. **Rendering** — `render` and `createTodoElement` build DOM using `textContent` exclusively (never `innerHTML`), ensuring XSS resistance by construction.

This separation makes the business logic fully testable in a Node.js environment without a DOM.

---

## Security

A full security audit was conducted — see [`discussion/security-review.md`](discussion/security-review.md). Summary:

- **XSS-safe:** user text is rendered only via `textContent`; no `innerHTML`, `document.write`, or `eval` anywhere in the code.
- **Input validation:** `hasValidInput` rejects empty, whitespace-only, and non-string input at the state-function level.
- **Data sanitization:** `loadFromLocalStorage` validates and filters every entry through `isValidTodo` before use, so tampered or corrupted `localStorage` cannot pollute state or crash the renderer.
- **Resilience:** all `localStorage` access is wrapped in try/catch with graceful in-memory fallback.

**Status: PASS — No vulnerabilities identified.**

---

## License

This project is licensed under the [MIT License](LICENSE) — you are free to use, modify, and distribute it.

---

## Contributing

Contributions are welcome! Please see the discussion files in [`discussion/`](discussion/) for design context and the security review.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Run the tests (`node tests/app.test.js`)
5. Open a pull request
