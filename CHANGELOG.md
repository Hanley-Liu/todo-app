# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Filter functionality: toggle between All, Active, and Completed views
- Clear completed button: bulk-remove all completed todos
- CONTRIBUTING.md with development workflow and coding guidelines
- CHANGELOG.md to track project history

### Changed
- Updated README.md and README.zh-CN.md with filter and clear-completed usage docs
- Updated test count badge in README.md from 72 to 98 passing

### UX
- Context-aware empty state: shows "No todos yet" when the list is truly empty, vs "No matching todos" when the current filter hides all items (prevents user confusion when filtering)
- "Clear completed" button now auto-hides when there are no completed todos, reducing visual clutter

### Fixed
- "Clear completed" button visibility was not updated after add, toggle, delete, or clear-completed operations — only updated during inline edit — so the button stayed hidden when it should have been visible (and vice versa); now `updateClearCompletedButton` is called after every state mutation and on initial render
- Inline editing double-fire bug: pressing Escape (or Enter) during edit triggered `finishEdit` from both the `keydown` and subsequent `blur` event, causing a DOM `NotFoundError` because `editInput` had already been replaced by `textSpan` — added an `isFinished` guard flag to ensure `finishEdit` runs exactly once per edit session
- Test suite crashed on load: mock `document` was missing `getElementById` and `readyState`, causing `init()` to throw `TypeError` before any tests could run
- Mock DOM element `className` setter did not sync into `classList` array, so `classList.contains('completed')` always returned false
- Mock list `appendChild` did not transfer children from `DocumentFragment`, so rendered list length was 1 instead of the expected count
- Mock list lacked a `firstChild` getter, so `render()` could not clear previous children between re-renders
- Strikethrough test asserted `completed` class on `.todo-text` span instead of the `.todo-item` li (CSS applies strikethrough via descendant selector)

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
- Test count inconsistency across documentation: README.md body text and project tree said "72 tests" while the badge and actual test suite reported 98; README.zh-CN.md badge said "72 passing" while body text said "72"; CONTRIBUTING.md said "72 tests" — all references now consistently state 98 tests
