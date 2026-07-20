# SnapYoga

A Next.js (App Router) yoga pose-analysis app. Firebase Auth + Firestore + Storage.

## Design work — read the brand guide first

Before doing **any** UI, styling, or cosmetic work, read **[`docs/brand-guide.md`](docs/brand-guide.md)**.
It is the source of truth for SnapYoga's visual identity — the dual light/dark theme, palette,
typography, components, motifs, and hard-won do/don't rules. A rendered version is at
`docs/brand-guide.html`.

The live theme values live in [`src/app/globals.css`](src/app/globals.css) (`.sy-*` classes and the
theme tokens). If the guide and the code disagree, the code wins — then update the guide to match.

Quick reference:
- **Light** = lavender gradient + amethyst `#320E3B` + cream hero titles.
- **Dark** = ink gradient + gold `rgba(193,154,107,*)` + parchment text.
- Headings are Cormorant Garamond (serif); labels/body are system sans.
- Design both themes on their own terms — never invert one into the other.
