# Reddit Launch Post — /r/opensource

## Title

> **Showcase: Todo App — A zero-dependency, vanilla-JS todo list with localStorage persistence, 53 unit tests, and XSS-safe rendering**

## Body

Hey r/opensource!

I built a **Todo App** — a lightweight, zero-dependency todo list web app that runs in any modern browser with no build step, no npm install, and no framework.

### Why I built it

I wanted to show that you can build a clean, functional, fully-tested web app using only:

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES5 — no transpilation)**

…with zero third-party dependencies and a tiny footprint.

### Key features

| Feature | Details |
|---|---|
| **Add / Complete / Delete** | Full CRUD for todos — type and hit Enter, click the checkbox, or hit Delete |
| **localStorage persistence** | Todos survive page reloads automatically |
| **XSS-safe by design** | All user text rendered via `textContent`; `innerHTML` is never used |
| **Real-time validation** | Empty / whitespace-only input is rejected; Add button disables automatically |
| **Empty state** | Friendly "No todos yet" message when the list is empty |
| **Responsive** | Adapts to mobile and desktop |
| **Graceful degradation** | When localStorage is unavailable (e.g. private mode), the app works in-memory for the session |
| **100% unit tested** | 53 tests cover all core logic — exit code 0 on success, 1 on failure (CI-friendly) |

### Tech stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (no framework) |
| Logic | Vanilla JavaScript (ES5) |
| Persistence | localStorage (JSON) |
| Testing | Node.js built-in assert-style runner (no external deps) |

### Quickstart (under 10 seconds)

```bash
git clone https://github.com/Hanley-Liu/todo-app.git
cd todo-app
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

Or just open `index.html` directly in your browser! (Note: some browsers restrict `localStorage` over `file://`, so serving is recommended.)

### Links

- **GitHub**: https://github.com/Hanley-Liu/todo-app
- **License**: MIT
- **Tests**: `node tests/app.test.js` (53 passing, 0 failing)

### Feedback welcome!

I'm a solo developer and this is my first open-source release. I'd love feedback on:

- Code quality / architecture
- Testing strategy
- UX / design improvements
- Potential new features (tags? due dates? keyboard shortcuts?)

Thanks for checking it out! 🙏