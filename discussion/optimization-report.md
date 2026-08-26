# Optimization Report — Todo App

**Date:** 2026-08-25
**Reviewer:** Sisyphus (optimizer)
**Status:** Analysis complete — top improvements prioritized

## Current State

The todo-app project has been iterated with new features: edit, filter, and clear-completed.
The codebase has 72 passing tests (up from 53). Uncommitted changes are present in:
app.js, index.html, style.css, tests/app.test.js, README.md.

## Improvement Opportunities

### Priority 1 (High)

1. **README/Contributing test count inconsistency** — README.md badge says "72 passing" but body text says "53 tests" in 2 places. README.zh-CN.md says "53" everywhere. CONTRIBUTING.md says "53 tests". Fix all to 72.

2. **Edit UX uses `window.prompt()`** — Poor user experience, breaks keyboard flow, not mobile-friendly. Replace with inline editing (convert text span to input on click, save on blur/Enter).

3. **Test coverage gaps** — Missing tests for: `generateId` (uniqueness, format), `createTodoElement` (DOM creation, XSS safety), `render` (filtering, empty state), `updateAddButton` (enable/disable logic).

4. **Accessibility: missing `aria-live`** — Dynamic todo list updates (add/delete/edit) are not announced to screen readers. Add `aria-live="polite"` to the list container.

5. **Accessibility: missing focus management** — After adding a todo, focus should return to the input. After editing, focus should move to the edited item.

### Priority 2 (Medium)

6. **Performance: full re-render on every change** — `render()` rebuilds the entire list DOM on every add/toggle/delete/edit. For small lists this is fine, but could be optimized with targeted updates. Low priority given small scale.

7. **Keyboard accessibility for edit** — Currently edit opens a `prompt()` dialog. Inline editing should support Enter to save, Escape to cancel.

8. **Empty state message could be more helpful** — "No todos yet" is generic. Could be context-aware: "No active todos" when filter is "active", etc.

9. **Filter bar visibility** — Filter bar is always visible even when there are no todos. Could hide when empty.

### Priority 3 (Low)

10. **Add a "Select all" checkbox** — Common todo app pattern to toggle all todos at once.

11. **Add drag-and-drop reordering** — Would require a library or significant custom code. Low priority.

12. **Add a "Clear all" button** (not just "Clear completed") — Removes all todos regardless of completion state.

## Prioritized Action Items

| # | Priority | Item | Effort |
|---|----------|------|--------|
| 1 | High | Fix test count inconsistency in README/CONTRIBUTING | S |
| 2 | High | Replace `window.prompt` edit with inline editing | M |
| 3 | High | Add missing test coverage (generateId, createTodoElement, render, updateAddButton) | M |
| 4 | High | Add `aria-live` for screen reader announcements | S |
| 5 | High | Add focus management after add/edit | S |

## Decision

Implement items 1-5 in this iteration. Items 6-12 are deferred to future iterations.
