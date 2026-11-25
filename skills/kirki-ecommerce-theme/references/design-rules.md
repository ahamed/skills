# Design rules

## 1. Spacing: the 4-point grid

Every padding, margin, gap, inset, offset and fixed size is a multiple of 4px.
2px is allowed only for fine details: hairline offsets, badge padding,
focus-ring offset, icon nudges. Never 3px, 5px, 6px, 10px, 14px or 15px.

theme.json `settings.spacing.spacingSizes` (set `defaultSpacingSizes: false`)
and the matching tokens. The token number is the multiple of 4px:

| Token | Size | theme.json slug |
|---|---|---|
| `--<p>-space-0-5` | 2px (0.125rem) | `0-5` |
| `--<p>-space-1` | 4px (0.25rem) | `1` |
| `--<p>-space-2` | 8px (0.5rem) | `2` |
| `--<p>-space-3` | 12px (0.75rem) | `3` |
| `--<p>-space-4` | 16px (1rem) | `4` |
| `--<p>-space-5` | 20px (1.25rem) | `5` |
| `--<p>-space-6` | 24px (1.5rem) | `6` |
| `--<p>-space-8` | 32px (2rem) | `8` |
| `--<p>-space-10` | 40px (2.5rem) | `10` |
| `--<p>-space-12` | 48px (3rem) | `12` |
| `--<p>-space-16` | 64px (4rem) | `16` |
| `--<p>-space-20` | 80px (5rem) | `20` |
| `--<p>-space-24` | 96px (6rem) | `24` |
| `--<p>-space-32` | 128px (8rem) | `32` |

- Components use the tokens, not raw values. A raw value is allowed only for
  a 1px border, or a size that is not spacing (an icon size is still a
  multiple of 4: 16, 20, 24).
- Fluid section spacing uses `clamp()` between two tokens, for example
  `clamp(var(--<p>-space-12), 8vw, var(--<p>-space-24))`.
- Line heights are unitless; for a fixed row height use a multiple of 4
  (buttons 44px or 48px, inputs 44px, header 64px or 72px). Touch targets are
  at least 44×44px.
- Radius tokens: `--<p>-radius-sm` 2px, `-md` 4px, `-lg` 8px or 12px,
  `-pill` 999px. Minimal and editorial themes stay at 0–4px for buttons and
  frames.
- Check: `grep -nE '[^0-9.](3|5|6|7|9|10|11|13|14|15)px' resources/css -r`
  must find nothing but font sizes and 1px borders.

## 2. Typography

- Two families at most: one display, one text. Self-host variable `woff2`
  files in `assets/fonts/` with their licence file (OFL or another
  GPL-compatible licence), registered in `theme.json`
  `settings.typography.fontFamilies` with `fontFace` (`fontDisplay: swap`).
  No Google Fonts CDN: it sends shopper IP addresses to a third party.
- Base text 16px (1rem), line height 1.5 for body, 1.1–1.25 for display.
  Never body text below 14px; captions 12px at least.
- A modular scale with `clamp()` for the large steps: `xs` 0.75rem, `sm`
  0.875rem, `md` 1rem, `lg` 1.25rem, `xl` clamp(1.5rem, 3vw, 2rem),
  `2xl` clamp(2rem, 5vw, 3rem), `3xl` clamp(2.75rem, 8vw, 4.5rem).
- Prices use tabular figures (`font-variant-numeric: tabular-nums`).
- Small caps labels: `text-transform: uppercase`, `letter-spacing: 0.08em`,
  `xs` or `sm` size, `text-secondary` colour.

Pairings come from ui-ux-pro-max (`ui-ux-pro-max.md` §4 and §5): its
pairing wins when its licence is GPL-compatible. Use the table below only
as a fallback, when the typography search finds no pairing with a
GPL-compatible licence, and say so to the creator:

| Fallback for | Display | Text | Why |
|---|---|---|---|
| Modern Minimal | Inter Tight | Inter | One family, calm and very legible |
| Modern Minimal | Manrope | Manrope | Soft geometric, friendly for beauty and home |
| Modern Minimal | Geist | Geist | Precise and technical |
| Editorial Luxury | Fraunces | Inter | Warm high-contrast serif with a neutral grotesk |
| Editorial Luxury | Cormorant Garamond | Jost | Fashion-house serif with a geometric sans |
| Editorial Luxury | Playfair Display | Source Sans 3 | Classic magazine contrast |
| Bold Contemporary | Space Grotesk | Inter | Quirky grotesk for strong headlines |
| Bold Contemporary | Archivo (expanded widths) | Archivo | Wide, loud display from one family |
| Bold Contemporary | Bricolage Grotesque | DM Sans | Expressive, modern, still readable |

## 3. Product photos

- Record the style (studio cutout or lifestyle) and the ratio in plan.md.
  Every product image frame uses that ratio with `aspect-ratio` and
  `object-fit: cover` (lifestyle) or `contain` with padding (cutout), so
  mixed uploads still line up.
- Frames are `bg-surface`: never a coloured background (colours stay true).
- Ratios: 4:5 apparel (default), 3:4 luxury and editorial, 1:1 beauty,
  accessories and small goods, 16:9 or 21:9 only for hero and editorial
  banners.
- Images: `loading="lazy"` below the fold, `fetchpriority="high"` for the
  first product image and the hero, `srcset`/`sizes` from WordPress, a fixed
  ratio box so there is no layout shift. Alt text from the product name.
- The docs section "Photo guidelines" tells the merchant the ratio, the
  minimum size (for example 1600px on the long side) and the background.

## 4. Motion

Motion is there to show cause and effect (added to cart, drawer opened,
step changed), not to decorate. Smooth, short and minimal.

- Tokens: `--<p>-duration-fast` 160ms (hover, press), `-base` 240ms (reveal,
  drawer), `-slow` 400ms (page-level reveal). Easing `--<p>-ease-out`
  `cubic-bezier(0.22, 1, 0.36, 1)` for entering, `--<p>-ease-in`
  `cubic-bezier(0.4, 0, 1, 1)` for leaving. Exit is faster than enter.
- Animate only `transform` and `opacity` (and `color`/`background-color` for
  hover). Never width, height, top or left.
- Good: button and link hover colour, image hover scale ≤ 1.03 over 400ms,
  a fade-up reveal of ≤ 8px for sections and grid items (stagger ≤ 40ms,
  max 6 items), drawer slide, a quantity tick, a small bag count bump.
- Never: parallax, auto-playing carousels, scroll-jacking, spinning, motion
  that loops, large movement (> 24px) or a full-screen zoom. They cause
  motion sickness and slow down shopping.
- `@media (prefers-reduced-motion: reduce)`: remove transforms, keep only
  short opacity changes. JS reads the same media query.
- Reveals use one `IntersectionObserver`, add a class once, and then stop
  observing. Content is visible without JS (the hidden start state is set only
  when the script has run: `.<p>-js .<p>-reveal`).

## 5. Layout and components

- Mobile first. Breakpoints: 600px, 900px, 1200px. No horizontal scroll at
  320px. Gutter `--<p>-space-4` on mobile, `--<p>-space-6` or more on desktop.
- Page structure comes from the chosen layout specs in `plan.md` → Layouts
  (`layouts.md`). Do not fall back to the plugin's layout.
- Product grid: the column count of the chosen shop layout; when the spec
  does not say, 2 columns on mobile, 3 at 900px, 4 at 1200px. Gap is a
  space token.
- Buttons: one primary style (accent) per view for the main action, a
  secondary style (outline with `border-strong`, `text-primary` label) and
  a text link style. Focus ring: 2px `--<p>-focus-ring`, 2px offset, on
  `:focus-visible`.
- Forms: visible labels, error text next to the field in `state-critical`
  with an icon, not colour only.
- Shadows only for floating layers (drawer, popover, modal), from
  `shadow` at low alpha. Cards use a hairline or a surface step, not a shadow.

## 6. Clean code

- Write only what the module needs. No speculative options, no unused
  tokens, no helper for one call, no commented-out code.
- One component, one file: `resources/ts/components/<name>.ts` with a
  test, `resources/css/components/<name>.css`.
- CSS uses the role tokens and the `<p>-` class names. No `!important`
  except to beat a plugin rule that cannot be beaten by specificity (note why
  in a comment). No IDs in selectors.
- Comments say why, not what.
- Each module ends with: typecheck, lint, tests, `palettes:check` and the
  parity test passing.
