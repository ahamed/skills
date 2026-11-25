# Colour system

The colours come from the chosen ui-ux-pro-max style
(`ui-ux-pro-max.md` §4.1), and the style wins. Only **WCAG contrast** is a
hard rule: `palettes.mjs` fails on it. The rules in §1 to §3 are the default
for a quiet, photo-led store. The generator shows them as warnings. Follow
them when the style does not say otherwise, and tell the creator when the
chosen palette goes against one.

## 1. The 90-8-2 surface-first ratio (default, warns)

- **90 % neutral canvas and surfaces.** Two closely related neutrals:
  `bg-canvas` (the page) and `bg-surface` (one tonal step from it: product
  image frames, cards, sidebars, banners, the drawer). No pure `#000000`
  page, no saturated backgrounds.
- **8 % tonal type and hairlines.** `text-primary` (deep charcoal or
  off-black) for headings and prices, `text-secondary` for body and
  metadata, `text-muted` for quiet text (old prices, tax, counts, step
  numbers), and `border-subtle` hairlines instead of heavy shadows.
- **2 % one conversion accent.** `accent-primary` only for primary CTAs
  (Add to cart, Checkout, Place order), the active state (selected size,
  current step, current filter), links in running text and the focus ring.
  Not for headings, icons, decoration or section backgrounds.

## 2. Elegance constraints (default, warns)

- **One brand hue.** No secondary decorative colour. Make depth with
  lightness steps of the neutral base.
- **Tinted neutrals.** Tint the greys warm (stone, cream, sand) or cool
  (slate, ash, fog) toward the accent's temperature. Never flat untinted
  grey. Keep neutral saturation low (the generator warns above 30 % HSL).
- **Muted merchandising states.** Sale, low stock, in stock, ratings and
  errors use desaturated state colours, in small badge-contained shapes, so
  they never compete with the photos.
- **Contrast guardrail (hard).** At least 4.5:1 for `text-primary` on `bg-canvas`,
  and for the CTA label (`accent-on`) on `accent-primary` and on its hover.

## 3. Don't (default)

- Never put a coloured background behind a product grid. Image frames stay
  `bg-surface`, so the colour of a garment or product stays true.
- Never pure `#000000` text on `#FFFFFF`. Use a tinted off-black such as
  `#141413` or `#111827`. The generator warns on pure black and white.
- Never more than one saturated colour in a viewport, outside product photos.
  So: no accent-coloured banner next to an accent CTA, no saturated sale
  badge next to the CTA.

## 4. Tokens

The palette generator (`scripts/palettes.mjs`) derives every token from three
inputs per mode: `canvas`, `text`, `accent`. Do not hand-pick derived values
unless the creator asks; use `override` in `design/palettes.json` for that,
so the targets are still checked.

| theme.json slug | CSS token (`--<p>-…`) | Use | Target |
|---|---|---|---|
| `canvas` | `bg-canvas` | Page background | — |
| `surface` | `bg-surface` | Image frames, cards, drawer, sidebar | — |
| `text-primary` | `text-primary` | Headings, prices, body | 4.5:1 on canvas, surface, accent-soft |
| `text-secondary` | `text-secondary` | Metadata, labels, secondary body | ≥ 6:1, stronger than muted |
| `text-muted` | `text-muted` | Old price, tax, counts, step numbers | 4.5:1 |
| `border-subtle` | `border-subtle` | Hairlines, dividers (decorative) | — |
| `border-strong` | `border-strong` | Input borders, radio and checkbox rings | 3:1 |
| `accent-primary` | `accent-primary` | CTAs, active state, links, focus ring | 4.5:1 on canvas, surface |
| `accent-on` | `accent-on` | Label on the accent | 4.5:1 on accent and hover |
| `accent-soft` | `accent-soft` | Selected option tile, active filter chip | — |
| `success` / `critical` / `caution` | `state-success` / `-critical` / `-caution` | Stock, errors, sale | 4.5:1, muted |

Extra colours in `settings.custom.<p>.color` (not in the editor palette):
`accent-hover`, `success-soft`, `critical-soft`, `caution-soft`, `shadow`,
`scrim`. With mode Both, `settings.custom.<p>.color.dark` holds the dark value
of every slug and extra colour.

CSS names of the extra colours: `--<p>-accent-hover`,
`--<p>-state-success-soft`, `--<p>-state-critical-soft`,
`--<p>-state-caution-soft`, `--<p>-shadow-color`, `--<p>-scrim`.
`tokens.css` also sets `color-scheme` (`light`, `dark`, or `light` with
`scheme.css` switching it to `dark`), so browser controls follow the mode.

`--<p>-focus-ring` is `accent-primary`. Sale badges: `state-caution` text on
`state-caution-soft`. Out-of-stock and disabled options: `text-muted` with a
strike-through, never a colour.

## 5. How the generator wires it

- `theme.json` `settings.color.palette` holds the default palette (light, or
  dark when the mode is Dark).
- `styles/colors/<slug>.json` holds each kept palette as a colour-only
  variation. Its extra colours sit under a `color` key
  (`settings.custom.<p>.color`), because WordPress applies only the colour
  paths of a colour variation. After the tokens module, pick a preset in
  the Site Editor once and check that the dark values and extra colours
  change too.
- `resources/css/scheme.css` (mode Both) points every
  `--wp--preset--color--<slug>` and extra colour at its dark value inside
  `@media (prefers-color-scheme: dark)` unless `<html data-<p>-scheme="light">`,
  and always when `data-<p>-scheme="dark"`. Because the presets themselves
  change, block markup that uses `has-<slug>-color` follows the mode too.
- `resources/css/tokens.css` maps each preset to a `--<p>-…` role token
  with the default value as the fallback. Components use only the role tokens.

Commands (also in `package.json`):

```bash
npm run palettes            # write theme.json, styles/colors, scheme.css
npm run palettes:check      # fail on a contrast failure or a stale file
npm run palettes:preview    # write design/palettes.html
```

## 6. Making the 5 suggestions

- Take the inputs from ui-ux-pro-max (`ui-ux-pro-max.md` §4.1). The notes
  below are for the dark values it does not give, and for choosing which
  colour search results to keep.
- Each palette must feel different: vary temperature (warm / cool / neutral),
  depth (airy / deep) and the accent hue. Keep all five inside the chosen style.
- Start from the niche. Examples, not rules: skincare → bone, sage, clay;
  menswear → ash, ink, oxblood or forest; kids → cream, a friendly blue or
  tomato (still one accent); jewellery → ivory or near-black, a gold-brown.
- Dark mode: canvas around `#111`–`#1A1A1A` with a tint, text around
  `#E8E6E1`, and a lighter, slightly less saturated version of the same accent
  hue. The accent must not glow: keep its saturation at or below the light one.
- Write the mood line so the creator can choose without reading hex values.
