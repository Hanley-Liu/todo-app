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

### Fixed
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
