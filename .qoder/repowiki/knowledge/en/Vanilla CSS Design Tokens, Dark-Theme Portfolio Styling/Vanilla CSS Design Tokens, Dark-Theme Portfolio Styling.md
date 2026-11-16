---
kind: frontend_style
name: Vanilla CSS Design Tokens, Dark-Theme Portfolio Styling
category: frontend_style
scope:
    - '**'
source_files:
    - css/style.css
    - index.html
---

## Approach

The portfolio is styled with **vanilla CSS** only — no preprocessors (no SCSS/Sass), no framework (no Tailwind, Bootstrap, etc.), and no build step. All styling lives in a single file `css/style.css`, linked from `index.html` via `<link rel="stylesheet" href="css/style.css">`. Typography is loaded from Google Fonts (`Inter` for body, `Sora` for headings) using `rel="preconnect"` hints.

## Key Files

- `css/style.css` — the entire stylesheet (~1508 lines), organized as a top-to-bottom document that mirrors the HTML section order.
- `index.html` — semantic HTML5 markup referencing classes defined in the stylesheet; fonts are declared here.
- `js/script.js` — adds/ toggles modifier classes such as `.is-scrolled`, `.is-open`, `.is-active` that drive visual state changes.

## Architecture & Conventions

### Design tokens via CSS custom properties
All colors, spacing, typography, radii, shadows, gradients, layout widths, and motion values are centralized under `:root` at the top of `style.css`:

- Backgrounds: `--bg`, `--bg-soft`, `--surface`, `--surface-2`, `--border`, `--border-strong`
- Text: `--text`, `--text-muted`, `--text-dim`
- Brand palette: `--primary` (#6366f1 indigo), `--accent` (#22d3ee cyan), `--pink`, `--success`, `--danger`, `--warning`
- Gradients: `--gradient`, `--gradient-soft`, `--gradient-text`
- Shape & depth: `--radius-sm`, `--radius`, `--radius-lg`, `--shadow-sm`, `--shadow`, `--shadow-glow`
- Typography: `--font-body` (Inter + system stack), `--font-heading` (Sora + Inter)
- Layout: `--container` (1140px), `--header-height` (76px)
- Motion: `--ease` (cubic-bezier), `--speed` (0.35s)

The file header explicitly documents this as "Design tokens (colors, fonts, spacing) — change the theme here", making it the single source of truth for the visual identity.

### Section-by-section organization
`style.css` follows a strict top-down order matching `index.html`:
1. Design tokens (`:root`)
2. Reset & base styles
3. Reusable pieces (`.container`, `.btn`, `.section`, `.eyebrow`, `.section-title`, `.section-subtitle`)
4. Header & navigation
5. Hero
6. About
7. Skills
8. Projects
9. Contact
10. Footer & back-to-top
11. Scroll animations
12. Responsive rules
13. Reduced-motion accessibility

### Component-like class naming
Classes follow a flat BEM-ish convention without nesting:
- Buttons: `.btn` + modifiers `.btn-primary`, `.btn-ghost`, `.btn-outline`, `.btn-sm`, `.btn-block`
- Sections: `.section` + variant `.section-alt`
- Cards: `.stat-card`, `.skill-card`, `.project-card`
- Utility-like: `.gradient-text`, `.container`, `.eyebrow`

Modifier states are applied by JavaScript toggling classes like `.is-scrolled` (on `.header`), `.is-open` (on `.nav-toggle`), `.is-active` (on `.nav-link`).

### Visual style
- **Dark theme**: background `#07070c` with layered surfaces and translucent borders.
- **Gradient accents**: indigo→cyan gradient used on buttons, progress bars, stat numbers, and decorative elements.
- **Glassmorphism**: `.header.is-scrolled` uses `backdrop-filter: blur(18px)`; `.btn-ghost` uses `backdrop-filter: blur(8px)`.
- **Glow effects**: radial-gradient blobs (`.glow-1`, `.glow-2`) behind the hero; `--shadow-glow` on hover.
- **Typography**: fluid sizing via `clamp()` for `.section-title`, `.hero-title`, `.hero-subtitle`; heading font-weight 700–800, body 400.
- **Motion**: transitions use the shared `--speed` / `--ease` variables; keyframe animations include `float`, `pulse-ring`, `blink`, `gradient-shift`, `wheel`.

### Accessibility
- `:focus-visible` gets a 2px solid accent outline with offset.
- Decorative SVGs carry `aria-hidden="true"`.
- Navigation toggle has `aria-expanded` / `aria-controls`.
- Skill progress bars use `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
- Form status messages use `role="status" aria-live="polite"`.
- A reduced-motion media query is present (listed in the file header).

### Responsive strategy
- Mobile-first approach with a hamburger menu (`.nav-toggle`, hidden on desktop via `display: none`).
- Fluid type through `clamp()`.
- Grid layouts switch from multi-column to single-column via media queries (e.g., skills grid, projects grid).
- The container max-width is `var(--container)` = 1140px with `padding-inline: 24px`.

### Constraints enforced by the codebase
- No CSS-in-JS or component library is used — all styles are plain CSS in one file.
- Colors and spacing should be referenced through CSS custom properties rather than hard-coded literals (as documented in the token section comment).
- The stylesheet order must mirror the HTML section order, as stated in the file's opening comment block.