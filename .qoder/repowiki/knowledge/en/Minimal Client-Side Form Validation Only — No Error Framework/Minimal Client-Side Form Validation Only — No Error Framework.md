---
kind: error_handling
name: Minimal Client-Side Form Validation Only — No Error Framework
category: error_handling
scope:
    - '**'
source_files:
    - js/script.js
    - index.html
    - css/style.css
---

## What system/approach is used

This repository is a vanilla single-page portfolio (HTML + CSS + one JS file). It has **no error-handling framework**, no custom error types, no sentinel errors, no panic/recover equivalent, and no middleware layer. The only error-related logic is **client-side form validation** for the contact form.

## Key files

- `js/script.js` — contains all runtime behavior, including the form validation section (lines ~249–346).
- `index.html` — defines the `<form id="contactForm" novalidate>` and per-field `<span class="field-error" id="...Error">` placeholders.
- `css/style.css` — provides the `.is-invalid` / `.is-error` visual styles referenced by the JS.

There is no `errors/` directory, no error constants file, and no dedicated error module.

## Architecture and conventions observed

1. **Validation model**: Each field is described by an entry `{ input, error, validate(value) }` in a local `fields` object. The `validate` function returns an empty string on success or an error message string on failure.
2. **Per-field feedback**: `checkField(key)` sets `field.error.textContent = message`, toggles `field.input.classList.toggle("is-invalid", Boolean(message))`, and updates `aria-invalid` accordingly. This couples the error state to DOM classes rather than a typed error object.
3. **Global status message**: On submit, if any field fails, the shared `#formStatus` element receives `status.textContent = "Please fix the highlighted fields."` plus the `is-error` class; focus is moved to the first `.is-invalid` field inside the form.
4. **No async/network error paths**: The submit handler simulates sending via `setTimeout`; it logs to `console.log` and shows a success message. There is no `fetch` call, so there are no network error branches to handle.
5. **No global error interception**: There is no `window.onerror`, `window.addEventListener("unhandledrejection", ...)`, `try/catch` blocks, or `throw` statements anywhere in the codebase.
6. **No defensive checks around DOM queries**: The helpers `$` / `$$` delegate directly to `querySelector` / `querySelectorAll`; callers do not guard against null results from these lookups.
7. **No logging infrastructure**: Aside from the single `console.log("Form submitted:", data)` line, there is no logger abstraction.

## Conventions and constraints

- Error messages are plain strings returned from per-field `validate` functions; they are never represented as objects or enums.
- Invalid state is communicated to the UI exclusively through CSS classes (`is-invalid` on inputs, `is-error` on the status element), not through a centralized error store.
- Accessibility attributes (`aria-invalid`, `aria-live="polite"` on `#formStatus`) are updated alongside the visual error state.
- Because the form uses `novalidate` on the `<form>` tag, the browser's built-in validation is intentionally disabled and all validation is delegated to the JS `validate` functions.
- There are no rules enforced by linters, tests, or build scripts in this repo that mandate a particular error-handling pattern — the conventions above are purely descriptive of what the code does.