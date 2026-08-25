# Architecture: Todo App

## Overview
Single-page, client-side web app with no backend.

## Components
1. **HTML** (`index.html`): Main page with input field, add button, and todo list container.
2. **CSS** (`style.css`): Basic styling for layout, completed state (strikethrough), and delete button.
3. **JavaScript** (`app.js`): App logic - add/complete/delete todos, localStorage persistence.

## Data Model
```
Todo = {
  id: string (timestamp-based unique id),
  text: string,
  completed: boolean
}
```

## State Management
- In-memory array of Todo objects.
- Sync to / loaded from `localStorage` on init.

## Render Flow
- `render()`: Re-renders the todo list from current state.
- Event handlers on input, add button, and list (for complete/delete) update state and re-render.
- Logic is split into pure functions (`addTodo`, `toggleTodo`, `deleteTodo`, `saveToLocalStorage`, `loadFromLocalStorage`) that accept/return state rather than touching DOM/localStorage directly, so they can be unit-tested in isolation.

## Persistence Acceptance Criteria
- **Storage key**: `'todo-app:todos'` (namespaced to avoid collisions).
- **Serialize/deserialize**: `JSON.stringify` on save; `JSON.parse` wrapped in try-catch on load; validate parsed result is an array matching the `Todo` shape.
- **Sync strategy**: Persist to `localStorage` on every successful state mutation (add, toggle, delete).
- **Error handling**: If `localStorage` is unavailable (quota, private mode), silently degrade — keep state in-memory for the session, do not crash. Log a console warning.
- **Acceptance test**: After adding todos and reloading the page, the list must contain the same todos with their completion states intact.

## Input Validation
- Empty or whitespace-only input is ignored (Add button disabled / submission no-op).
- Empty-state message shown when list is empty ("No todos yet").
- IDs: timestamp + random suffix to reduce collision risk.

## File Structure
```
todo-app/
  index.html
  style.css
  app.js
  tests/
    app.test.js
  README.md
```

## Security
- **XSS mitigation**: Never use `innerHTML` with user text. Use `textContent` / `createTextNode` when rendering todo text.
- **Data sanitization**: Validate parsed localStorage data is an array; filter out entries missing required fields or with wrong types before merging into state.
- A `security-review.md` will be produced by the security-auditor agent.

## Mobile
- Responsive layout (flexible container, wrap-friendly list items).
