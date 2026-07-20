# SnapYoga — Brand Cosmetics Guide

> **Source of truth for SnapYoga's visual identity.** Read this before any UI or design work
> so every new surface keeps reading as one considered, breathing whole across both themes.
> A rendered, interactive version lives in [`brand-guide.html`](./brand-guide.html) (open in a browser).
> The live values are in [`src/app/globals.css`](../src/app/globals.css) — if this doc and the code
> ever disagree, the code wins; update this doc to match.

---

## Essence — Listen · Guide · Activate

SnapYoga should feel like a slow exhale: **warm, unhurried, quietly premium**, never clinical or
loud. The mood is a candle-lit studio at dusk, not a fitness tracker. Restraint is the house style —
generous space, one accent doing the work, motion that breathes rather than blinks.

Two moods, one identity. **Light** is a soft lavender morning; **dark** is an amber-lit evening.
Every element must be designed for both — never invert one into the other.

---

## Colour — two themes

The whole palette hangs off one full-bleed gradient background per theme. Amethyst leads in light;
warm gold leads in dark. Copy these values exactly.

### Light (lavender morning)

| Role | Value | Use |
|------|-------|-----|
| Background | `linear-gradient(175deg,#B0B5C0 0%,#9DA4B0 35%,#A8A0BC 70%,#9B96B5 100%)` | full-bleed page gradient |
| Amethyst | `#320E3B` | text, icons, filled buttons, accents |
| Cream | `rgba(255,248,235,0.96)` | hero titles **on the bare gradient only** |
| Glass | fill `rgba(255,255,255,0.12)` · hairline `rgba(255,255,255,0.40)` | frosted cards |

### Dark (ink evening)

| Role | Value | Use |
|------|-------|-----|
| Background | `linear-gradient(175deg,#1a1210 0%,#0D1821 55%,#1a0f1e 100%)` | full-bleed page gradient |
| Gold | `rgba(193,154,107,*)` | accent, icons, highlights |
| Parchment | `rgba(255,240,215,*)` | text (≈0.90 heading, ≈0.66 body, ≈0.44 muted) |
| Glass | fill `rgba(255,240,215,0.05)` · hairline `rgba(193,154,107,0.18)` | frosted cards |

### Shared semantic accents (same meaning in both themes)

Semantic colour is **separate** from the amethyst/gold identity. Deepen it for light so it survives
the lavender; brighten it for dark.

| Meaning | Light | Dark |
|---------|-------|------|
| Mood · green | `#3B6D11` | `rgba(160,195,130,0.95)` |
| Habits · terracotta | `#A8531C` | `rgba(200,140,90,0.95)` |
| Score ramp (low→high) | coral `#C8785A` → amber `#C88C5A` → sage `#B4BE78` → green `#A0C382` | same ramp |
| Session card gradients | amethyst · mocha · plum (cycle per card) | same, on ink |

---

## Typography

**Cormorant Garamond** (falling back to Georgia) carries every headline, title, number and price —
high-contrast, elegant, human. **System sans** handles labels, body and data, and never competes.
Two weights only: 400 and 500–600.

| Role | Face / weight | Size |
|------|---------------|------|
| Wordmark | serif 500 | clamp ~28–58px · **always the largest text on the screen** |
| Hero title ("Hey, {name}!") | serif 600 | 24–26px |
| Card heading (`.sy-card-heading`) | serif 600 | 18px |
| Eyebrow / section label | sans 600 · UPPERCASE · ~.28em tracking | 9–11px |
| Body | sans 400 | 12–15px |
| Numerals (scores, stats, streaks) | serif | per context |

Sentence case everywhere except uppercase eyebrow labels. Give eyebrows real tracking (~.28em) and
keep them small but **full-strength in colour** — a faint eyebrow reads as a mistake, not a whisper.

---

## Components

- **Frosted glass card** — every surface. Gradient fill + inset top highlight + soft drop shadow =
  depth. **Uniform 20px radius**; no mixed or notched corners.
- **Primary button** — filled pill, serif label. Amethyst fill + cream text in light; translucent
  in dark. Never black text on the amethyst fill.
- **Navigation** — circular icon button, **48px** (a 40px variant is fine on content pages; keep the
  shape and fill identical). Amethyst-filled in light, translucent-black in dark.
- **Badges & pills** — small, serif, rounded. Status colour follows meaning; membership/tier colour
  follows the theme accent (amethyst in light, gold in dark).

---

## Motifs — the signatures

- **The orbit.** A dashed ring with a single dot in slow, continuous orbit — the brand's quiet
  heartbeat. It haloes the avatar and echoes softly behind the wordmark on auth & onboarding.
  **Continuous rotation only — never fade the dot on/off** (it reads as a flicker).
- **Glass & light.** Depth comes from three layers, not borders: a subtle gradient fill, a 1px inset
  top highlight (the "glass edge"), and a soft outer shadow. A whisper of sparkle (≤2 marks) is
  allowed; heavy glow is not.

---

## Layout patterns

- **Onboarding & auth.** Brand lockup up top (wordmark — **always the largest text** — tagline,
  divider, orbit echo). The step's title and subtitle live **centred inside the frosted card**,
  above the content. Back/next circles sit inside the card; the theme toggle pins top-right.
- **Dashboard & app.** A compact greeting header ("Hey, {name}!" left, actions right) over a stack
  of frosted section cards, each led by a small eyebrow. Summary before detail; state shown as form
  (rings, dots, bars, chips) as well as number. Interactive things look interactive.

---

## Hard-won rules

**Do**
- **Amethyst on glass.** Text on a frosted-light card is amethyst; cream is reserved for hero titles
  on the bare gradient — cream on glass washes out.
- **Two amethyst tones.** Full `#320E3B` for body and eyebrows; the same hue reads as *fill* on
  buttons — pair with cream, never black text.
- **One radius, one rhythm.** Uniform 20px card corners; consistent eyebrow → title → body → caption
  ladder on every card.

**Don't**
- **Don't let the page title beat the logo.** On onboarding the wordmark is the hero; the step
  heading sits smaller beneath it.
- **Don't invert a theme.** Design each ground on its own terms — dark isn't light with the lights
  off. Gold leads dark; amethyst leads light.
- **Don't over-animate.** Motion breathes (4–5s pulses, slow orbits). No blinking, no bright glows,
  no scattered effects — respect `prefers-reduced-motion`.

---

*SnapYoga — internal brand cosmetics reference · Listen · Guide · Activate*
