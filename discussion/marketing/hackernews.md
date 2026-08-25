# Show HN Post — news.ycombinator.com

## Title (must be <80 chars)

Show HN: Todo App — zero-dependency, localStorage-backed todo list, 53 tests

---

## Body

I built a **Todo App** — a lightweight, zero-dependency todo list web app that runs in
any modern browser with no build step, no npm install, and no framework.

Just HTML5, CSS3, and a single vanilla JavaScript file (ES5, no transpilation).

### Highlights

- **Add / Complete / Delete** — full CRUD with Enter key & button support
- **localStorage persistence** — todos survive page reloads automatically
- **XSS-safe by design** — all user text rendered via `textContent`; `innerHTML` is never used
- **Real-time validation** — rejects empty/whitespace input; Add button disables automatically
- **Responsive design** — works on mobile and desktop
- **Graceful degradation** — in-memory fallback when localStorage is unavailable (private mode)
- **100% unit tested** — 53 tests, exit 0 on success / 1 on failure (CI-friendly)

### Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (no framework) |
| Logic | Vanilla JavaScript (ES5, no transpilation) |
| Persistence | localStorage (JSON) |
| Testing | Node.js built-in assert-style runner (zero deps) |

### Quickstart (<10 seconds)

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Or just open `index.html` directly in your browser (some browsers restrict localStorage
over `file://`, so serving is recommended).

### Source & License

- GitHub: https://github.com/Hanley-Liu/todo-app
- License: MIT

### What would you improve?

I'd love feedback on:

- Code quality / architecture
- Testing strategy
- Potential new features (tags, due dates, keyboard shortcuts)

Thanks for checking it out!