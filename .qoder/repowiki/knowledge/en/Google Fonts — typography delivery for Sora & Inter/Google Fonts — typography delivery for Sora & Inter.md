---
kind: external_dependency
name: Google Fonts — typography delivery for Sora & Inter
slug: google-fonts
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
---

The site loads two typefaces from Google Fonts via `fonts.googleapis.com` / `fonts.gstatic.com` using `rel="preconnect"` and a `display=swap` stylesheet link:
- **Sora** (600/700/800) — used as `--font-heading`.
- **Inter** (300/400/500/600) — used as `--font-body`.

This is the only third-party network dependency in the repo; everything else (CSS, JS, SVG icons) is self-hosted. If Google Fonts is blocked, the fallback stack falls back to `system-ui` / `-apple-system` / `Segoe UI` sans-serif.