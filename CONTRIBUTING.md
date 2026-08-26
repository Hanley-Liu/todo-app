# Contributing to Todo App

Thank you for your interest in contributing! This document outlines the process
for submitting changes.

## Development Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/todo-app.git
   cd todo-app
   ```
3. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feat/your-feature
   ```

## Running Tests

This project uses a zero-dependency test runner. No `npm install` is required.

```bash
node tests/app.test.js
```

All **72 tests** should pass before submitting a pull request.

## Coding Guidelines

- **Vanilla JavaScript (ES5)** — no transpilation, no frameworks.
- **No `innerHTML`** — always use `textContent` or `createTextNode` to prevent XSS.
- **Pure state functions** — keep business logic separate from DOM and persistence.
- **Immutability** — never mutate state arrays in place; return new arrays.
- **Graceful degradation** — localStorage failures should not crash the app.

## Pull Request Process

1. Ensure all tests pass: `node tests/app.test.js`
2. Update documentation if your change affects user-facing behavior.
3. Add tests for any new state functions.
4. Keep PRs focused — one feature or bugfix per PR.
5. Reference any relevant issues in your PR description.

## Reporting Issues

- **Bug reports** — include steps to reproduce, expected behavior, and actual behavior.
- **Feature requests** — describe the use case and any proposed API.
- **Security vulnerabilities** — please report responsibly via email.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](LICENSE).
