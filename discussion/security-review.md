# Security Review — Todo App

**Project:** todo-app
**Scope:** `app.js`, `tests/app.test.js`
**Date:** 2026-08-25
**Reviewer:** Sisyphus (security audit)
**Status:** PASS — No vulnerabilities identified

## Executive Summary

The todo app implements a layered defense-in-depth strategy across three layers:
input validation, data sanitization on read, and XSS-safe rendering. A manual
code audit of `app.js` (369 lines) confirmed all three controls are present and
correctly applied. The test suite in `tests/app.test.js` was executed with
`node tests/app.test.js`; all **53 tests pass**, covering every security-relevant
code path. No high-, medium-, or low-severity findings were identified.

---

## Findings

| # | Severity | Area | Finding | Verdict |
|---|----------|------|---------|---------|
| 1 | — | Rendering | User text rendered exclusively via `textContent` | SAFE |
| 2 | — | Persistence | No `innerHTML` / `outerHTML` / `document.write` / `eval` in application code | SAFE |
| 3 | — | Sanitization | `loadFromLocalStorage` routes parsed data through `sanitizeTodos` | SAFE |
| 4 | — | Validation | `hasValidInput` rejects empty, whitespace-only, and non-string input | SAFE |
| 5 | — | Data integrity | `isValidTodo` enforces strict shape on stored records | SAFE |
| 6 | — | Resilience | `localStorage` access is wrapped in try/catch with graceful degradation | SAFE |

No open findings. All controls behave exactly as designed and verified by the
test suite.

---

## XSS Analysis

**Conclusion: XSS-resistant by construction.**

The application's rendering layer (`createTodoElement`, `render`) never writes
untrusted data into a property that interprets HTML.

### Evidence

1. **`textContent` for all user-supplied text**
   - Line 224: `textSpan.textContent = todo.text;`
   The todo's `text` field is the only user-generated value that reaches the DOM,
   and it is assigned to `textContent`, which serializes the string as plain text.
   Any HTML metacharacters (`<`, `>`, `&`, `"`) are rendered literally and are
   **not** parsed as markup.

2. **No dangerous sinks present**
   A repository-wide grep for `innerHTML`, `outerHTML`, `document.write`,
   `eval(`, and `insertAdjacentHTML` returned **zero** matches in application code.
   The only references to `innerHTML` are two inline comments that explicitly
   forbid its use:

   ```
   // Rendering (textContent only — never innerHTML)        // line 198
   // textContent is XSS-safe — never use innerHTML        // line 223
   ```

3. **`setAttribute` uses only hardcoded literals**
   `setAttribute` is called twice, both with constant string values:
   - Line 216–219: `aria-label` = `'Mark as ' + (completed ? 'incomplete' : 'complete')`
     — a ternary over two hardcoded literals, no user data.
   - Line 230: `aria-label` = `'Delete todo'` — constant string.
   Neither call incorporates todo content, so there is no attribute-injection
   surface. (Note: even if user data reached `setAttribute`, attribute-value
   injection would require a quoting break; here the concern is moot because
   literals are used.)

4. **No `createTextNode` needed**
   The codebase comment (line 203) states "All user text is inserted via
   `textContent` / `createTextNode` only." `textContent` was chosen over
   `createTextNode`, which is equally safe — both avoid HTML parsing. Either
   choice is acceptable; the key invariant is that **no parsing sink is used**,
   and this holds.

### Attack scenario considered

*If a user submits `<img src=x onerror=alert(1)>` as a todo:* `addTodo` trims
whitespace and stores the raw string in `text`. On render, `textSpan.textContent`
assigns it verbatim; the string is serialized as text and displayed as the
literal characters `<img src=x onerror=alert(1)>`. No script executes. The
malicious payload is rendered as harmless, visible text. **XSS is not possible.**

---

## Data Sanitization

**Conclusion: Stored data is validated before use; corrupted or tampered
`localStorage` cannot inject invalid state or break the renderer.**

### Controls

1. **`sanitizeTodos(arr)`** (lines 120–125)
   - Returns `[]` for any non-array input (`null`, `undefined`, strings,
     objects with no `Array.isArray`).
   - Filters every entry through `isValidTodo`, discarding anything that does
     not conform to the `Todo` shape.

2. **`isValidTodo(todo)`** (lines 103–111)
   Enforces a strict structural contract:
   - `todo` must be a non-null `object`
   - `id` must be a `string`
   - `text` must be a `string`
   - `completed` must be a `boolean`

   This guards against type-confusion, prototype-pollution vectors, and schema
   drift where a tampered `localStorage` entry might otherwise cause a runtime
   error or unexpected behavior in the renderer.

3. **`loadFromLocalStorage()`** (lines 178–195)
   - Wraps `JSON.parse` in try/catch; corrupted JSON yields `[]` and a warning.
   - Calls `sanitizeTodos(parsed)` on the parsed result — so even valid JSON
     with the wrong shape (e.g., a single object, or an array of malformed
     records) is reduced to a clean array of valid todos.
   - Handles the absence-of-`localStorage` case (private mode, disabled storage,
     non-browser environment) by returning `[]`.

### Threat modeled

An attacker who can write to `localStorage` (e.g., via cross-site scripting in a
*compromised* browser, or a malicious extension) cannot:
- Crash the renderer with a non-array or non-object payload — sanitized to `[]`.
- Inject a record with `completed: "yes"` or `id: 1` — type-checked and dropped.
- Cause the app to render attacker-controlled `id`/`text` of the wrong type —
  only well-formed strings/booleans reach `createTodoElement`.

### Scope note on "sanitization" semantics

The term "sanitization" here refers to **structural/type validation**, not to
HTML-content stripping. This is the correct design: because the renderer uses
`textContent` (see XSS Analysis above), there is no rendering sink that
interprets HTML, so stripping HTML from `text` would be redundant. The data-
sanitization layer's job is to ensure the in-memory model matches the `Todo =
{ id: string, text: string, completed: boolean }` contract, which it does
robustly.

---

## Input Validation

**Conclusion: Input is validated at every entry point; empty or malformed input
is rejected before it can affect state.**

### Controls

1. **`hasValidInput(value)`** (lines 46–48)
   ```js
   return typeof value === 'string' && value.trim() !== '';
   ```
   Returns `true` only for non-empty, non-whitespace strings. Rejects empty
   strings, whitespace-only strings, tabs, and any non-string type
   (`null`, `undefined`, numbers, objects).

2. **`addTodo(todos, text)`** (lines 57–63)
   - Calls `hasValidInput(text)` and returns the original array unchanged if
     the input is invalid. This is the authoritative server-of-truth gate for
     state mutation — even if the UI is bypassed, state cannot be polluted.
   - Trims the validated input with `text.trim()` before storage, so stored
     todos never contain leading/trailing whitespace.

3. **UI layer (`init`)** (lines 272–318)
   - `updateAddButton` (line 272–274) disables the Add button whenever
     `hasValidInput(input.value)` is false, providing real-time feedback.
   - On form submit (line 304–318), `hasValidInput` is re-checked before
     `addTodo` is called. This is a deliberate defense-in-depth measure: the
     code comment notes "Re-validate — the button may be enabled via keyboard
     submission." Because the state-function path (`addTodo`) is independently
     gated, the UI validation is redundant-but-safe rather than relied upon.

### Verification

The test suite exercises `hasValidInput` and `addTodo` with:
- Non-empty text ✓
- Text with leading/trailing whitespace ✓ (accepted, then trimmed)
- Empty string ✓ (rejected)
- Whitespace-only string ✓ (rejected)
- Tab-only string ✓ (rejected)
- `null`, `undefined`, number input ✓ (rejected)
- Empty/whitespace input into a non-empty array ✓ (array returned unchanged)

---

## Test Coverage

`node tests/app.test.js` → **53 passed, 0 failed.**

The suite provides direct verification of each security control:

| Control | Tests covering it | Result |
|---|---|---|
| `hasValidInput` | 6 | PASS |
| `addTodo` (validation + trim + immutability) | 6 | PASS |
| `sanitizeTodos` | 4 | PASS |
| `isValidTodo` | 8 | PASS |
| `loadFromLocalStorage` (corrupt JSON, non-array, invalid entries, missing storage) | 6 | PASS |
| `saveToLocalStorage` (degrade when unavailable / throws) | 4 | PASS |
| Round-trip persistence (incl. toggle/delete) | 3 | PASS |

The persistence tests (lines 490–597) specifically confirm that invalid entries
stored in `localStorage` are filtered on load — directly validating the
sanitization path described above.

---

## Verdict

**PASS — No security vulnerabilities identified.**

The todo app demonstrates textbook defense-in-depth:

- **Input validation** (`hasValidInput` / `addTodo`) prevents empty or
  malformed data from entering the state model, with the gate enforced at the
  state-function level (not solely at the UI).
- **Data sanitization** (`sanitizeTodos` / `isValidTodo` on every `localStorage`
  load) ensures that corrupted, tampered, or type-mismatched persisted data
  can never pollute the in-memory model or crash the renderer.
- **XSS prevention** is structural: rendering uses `textContent` exclusively,
  with no `innerHTML`, `document.write`, or other HTML-interpreting sinks
  anywhere in the application code.

All 53 unit tests pass, including the tests that specifically attack the
sanitization and persistence layers with malformed input.

The application is approved for use. No follow-up actions required.

### Recommendations (future hardening, optional — not findings)

These are suggestions for ongoing maintenance, not remediations of defects:

1. **CSP header.** If `index.html` is ever served rather than opened as a local
   file, add a restrictive `Content-Security-Policy` header as a second line of
   defense (e.g., `default-src 'self'`).
2. **Lint gate.** Add a static-analysis check (e.g., a no-`innerHTML` ESLint
   rule) to keep the XSS invariant from regressing in future contributions.
3. **Key rotation.** `STORAGE_KEY` is a stable, namespaced constant
   (`'todo-app:todos'`); no change needed unless schema migration is required.

---

*End of report.*
