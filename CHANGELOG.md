# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `updateFilterBar` function: hides the filter bar (All/Active/Completed buttons + Clear completed) when the todo list is empty, preventing confusing controls when there's nothing to filter
- 4 new tests for `updateFilterBar` covering empty list, incomplete-only, completed-only, and mixed todo states
- `adjustFilterIfNeeded` function: auto-switches the active filter to 'all' when the current filter ('active' or 'completed') would show zero todos, preventing users from being stranded on an empty filter view after toggling, deleting, or clearing completed todos
- 6 new tests for `adjustFilterIfNeeded` covering auto-switch on empty active/completed filter, no-op when 'all', no-op when todos exist, and auto-switch when no todos exist

### Changed
- Updated README.md and README.zh-CN.md test count from 102 to 106 (added `updateFilterBar` suite)
- Updated README.md and README.zh-CN.md test breakdown to include `updateFilterBar` suite (4 tests)
- Updated README.md, README.zh-CN.md, and CONTRIBUTING.md test count from 106 to 112 (added `adjustFilterIfNeeded` suite)
- Updated README.md test breakdown to include `adjustFilterIfNeeded` suite (6 tests)
- Refactored `init()` to use a `refreshView()` helper that centralizes render + button updates + auto-filter adjustment, replacing duplicated render/updateClearCompletedButton/updateFilterBar call sequences

### Fixed
- `CONTRIBUTING.md` stated "All **102 tests** should pass" but the actual test suite contains 106 tests; corrected to 106 to match reality
- UX gap: after clearing completed todos while on the 'completed' filter, or toggling the last active todo while on the 'active' filter, the user was left staring at a "No matching todos" empty state with no way to see their remaining todos without manually switching filters; `adjustFilterIfNeeded` now auto-switches to 'all' in these scenarios
- Test count badge in README.md and README.zh-CN.md displayed "106 passing" but the actual test suite contains 112 tests; corrected the badge URL to reflect the accurate count

### Added
- `updateFilterBar` function: hides the filter bar (All/Active/Completed buttons + Clear completed) when the todo list is empty, preventing confusing controls when there's nothing to filter
- 4 new tests for `updateFilterBar` covering empty list, incomplete-only, completed-only, and mixed todo states

### Changed
- Updated README.md and README.zh-CN.md test count from 102 to 106 (added `updateFilterBar` suite)
- Updated README.md and README.zh-CN.md test breakdown to include `updateFilterBar` suite (4 tests)

### Added
- Visual feedback for editing state: `.todo-item.editing` now has a distinct blue-tinted background and border to clearly indicate which todo is being edited

### Fixed
- `filterTodos` now returns a new array reference for the 'all' filter (previously returned the same array reference, inconsistent with 'active'/'completed' branches that always return copies — could cause subtle mutation bugs in callers expecting immutability)
- Mismatched parenthesis in `README.zh-CN.md` test breakdown: `filterTodos` entry used a full-width opening `（` but a regular ASCII closing `)`, producing `(7 测试)` instead of `（7 测试）`; corrected to consistent full-width parentheses matching all other entries

### Added
- Keyboard focus indicators (`:focus-visible`) on all interactive elements (buttons, checkboxes, inputs) for WCAG-compliant keyboard navigation
- `prefers-reduced-motion` media query to disable CSS transitions/animations for users who request reduced motion

### Changed
- Replaced empty no-op CSS rule (`.todo-form input:disabled, .todo-form button:disabled`) with meaningful focus-visible styles

### Added
- Filter functionality: toggle between All, Active, and Completed views
- Clear completed button: bulk-remove all completed todos
- Clear completed button now shows dynamic count of completed todos (e.g. "Clear completed (3)")
- CONTRIBUTING.md with development workflow and coding guidelines
- CHANGELOG.md to track project history
- New test: `editTodo` creates a new object even when text is unchanged (immutability guarantee)

### Changed
- Updated README.md and README.zh-CN.md with filter and clear-completed usage docs
- Updated test count badge in README.md from 72 to 101 passing

### UX
- Context-aware empty state: shows "No todos yet" when the list is truly empty, vs "No matching todos" when the current filter hides all items (prevents user confusion when filtering)
- "Clear completed" button now auto-hides when there are no completed todos, reducing visual clutter
- Inline edit input now selects all text on focus, so users can immediately type to replace the existing content instead of manually clearing first
- Edit button now disables while a todo is being edited, preventing accidental double-initiation of the edit flow; re-enables on save/cancel/blur with visual `opacity` + `not-allowed` cursor feedback

### Fixed
- `clearCompleted` returned the same array reference when no completed todos existed, violating its documented 'Pure: does not mutate the input array' contract and being inconsistent with `filterTodos` (which always returns a new array); now always returns a new array reference via `filter`, ensuring immutability guarantees hold for all callers
- "Clear completed" button visibility was not updated after add, toggle, delete, or clear-completed operations — only updated during inline edit — so the button stayed hidden when it should have been visible (and vice versa); now `updateClearCompletedButton` is called after every state mutation and on initial render
- Inline editing double-fire bug: pressing Escape (or Enter) during edit triggered `finishEdit` from both the `keydown` and subsequent `blur` event, causing a DOM `NotFoundError` because `editInput` had already been replaced by `textSpan` — added an `isFinished` guard flag to ensure `finishEdit` runs exactly once per edit session
- Test suite crashed on load: mock `document` was missing `getElementById` and `readyState`, causing `init()` to throw `TypeError` before any tests could run
- Mock DOM element `className` setter did not sync into `classList` array, so `classList.contains('completed')` always returned false
- Mock list `appendChild` did not transfer children from `DocumentFragment`, so rendered list length was 1 instead of the expected count
- Mock list lacked a `firstChild` getter, so `render()` could not clear previous children between re-renders
- Strikethrough test asserted `completed` class on `.todo-text` span instead of the `.todo-item` li (CSS applies strikethrough via descendant selector)
- `editTodo` immutability test used a fresh array literal `[t1]` in the assertion `result !== [t1]`, which is always true and never verified the function returns a new array reference; corrected to compare against the original input array reference
- `editTodo` empty/whitespace-input tests used `assertDeepEqual` (JSON equality) to verify the same array was returned, which cannot distinguish between a new array with identical contents and the original reference; switched to `assertEqual` (reference equality) to actually verify the documented early-return behavior
- `clearCompleted` test asserted the same-array-reference behavior (the bug); updated to verify a new array reference is returned (`assertNotEqual`), enforcing the immutability contract; added `assertNotEqual` helper to the test runner

## [1.0.0] - 2026-08-25

### Added
- Initial release: Todo App with add, complete, delete, and localStorage persistence
- 53 unit tests covering state functions, persistence, and edge cases
- Bilingual README (English + Chinese)
- MIT LICENSE
- CI workflow (`.github/workflows/ci.yml`)
- Security review document
- Architecture and product requirements documents
- Marketing launch posts (Reddit, Hacker News, Twitter, Juejin)

### Fixed
- Test count inconsistency across documentation: README.md body text and project tree said "72 tests" while the badge and actual test suite reported 101; README.zh-CN.md badge said "72 passing" while body text said "72"; CONTRIBUTING.md said "72 tests" — all references now consistently state 101 tests
- README.md and README.zh-CN.md test breakdown listed incorrect per-suite test counts (e.g. `addTodo` 6→7, `editTodo` 5→9, `toggleTodo` 5→6, `filterTodos` 5→6, `clearCompleted` 4→5, `saveToLocalStorage` 4→5) and omitted six suites entirely (`generateId`, `createTodoElement`, `render`, `updateAddButton`, `updateClearCompletedButton`, `render (empty state)`); both READMEs now list all 19 suites with accurate counts
