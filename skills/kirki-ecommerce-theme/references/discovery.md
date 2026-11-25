# Discovery: the questions, in order

Ask one question at a time with AskUserQuestion. Put the recommended option
first and add "(Recommended)" to its label. Base each recommendation on the
answers so far. The creator can always type their own answer ("Other").
If an answer is unclear, ask a short follow-up before the next question.

Keep a running record of the answers. They go into `plan.md` → "Decisions".

## 1. Store niche

"What will the store sell?" Offer 4 common niches that fit any hint in the
request (for example: Fashion and apparel, Beauty and skincare, Home and
living, Jewellery and accessories). Ask a short follow-up for the product
range and the audience when the answer is broad ("Fashion" → menswear,
womenswear, kids, streetwear, luxury?). The niche drives every later
recommendation: style, palette moods, type, layouts, photo style, ratio.

If the creator described the store or the feel they want (in the request or
in an answer), keep that text. The ui-ux-pro-max query uses the niche plus
the strong words of that description (`ui-ux-pro-max.md` §2). Do not ask for
a description when there is none: the niche is enough.

## 2. Target style (ui-ux-pro-max)

Read `ui-ux-pro-max.md` first. Search the styles with the niche (and the
description, if any), and ask the creator to choose one of the top 4 styles
(`ui-ux-pro-max.md` §3). The `--design-system` style is first and
"(Recommended)". After the answer, persist the design system into
`<theme>/design/` (§4 of that file) as soon as the theme folder is known
(step 4).

The chosen style replaces the old fixed aesthetics. Every later step uses
it: palettes, fonts and layouts.

## 3. Theme name

Free text. Suggest 3 short names that fit niche + style as options.
Derive:

- **slug**: lower case, `a-z0-9-`, for example `north-row`. Folder, text domain, CSS prefix.
- **prefix**: the slug. CSS: `--north-row-*`, classes: `north-row-*`.
- **PHP namespace**: PascalCase of the name, for example `NorthRow`.
- **constant prefix**: upper snake case, for example `NORTH_ROW_`.

Check that the slug does not collide with an installed theme in
`wp-content/themes/`.

## 4. Theme folder

Default: `wp-content/themes/<slug>/` when the working directory is inside a
WordPress install (look for `wp-config.php` or `wp-content/` upward);
otherwise `./<slug>/`. Offer the default first, and let the creator type a path.
Also find the Kirki eCommerce plugin folder (`wp-content/plugins/kirki-ecommerce/`,
look for `kirki-ecommerce.php`). If it is not found, ask for its path: the
view overrides are copied from it, and the parity test reads it.

## 5. Colour mode

Light, Dark, or **Both** (default). With Both, the page follows the system
setting, and a header toggle lets the shopper choose (kept in localStorage).

## 6. Palettes (5 suggestions)

Read `color-system.md` and `ui-ux-pro-max.md` §4.1 first. Make 5 palettes
from ui-ux-pro-max: palette 1 from the `--design-system` colours, palettes
2 to 5 from the `--domain color` search for the chosen style. Map them with
the table in §4.1, and add the dark values when the mode needs them. Each palette: a slug, a title, a one-line mood ("warm stone and
terracotta, quiet and tactile"), and per mode three inputs: `canvas`, `text`,
`accent`. Write them to `<theme>/design/palettes.json` (set `default` to the
first palette for now, and `keep: true`), copy `scripts/palettes.mjs` from
this skill into `<theme>/scripts/`, and run:

```bash
node <theme>/scripts/palettes.mjs preview --dir <theme>
```

A failure is a WCAG contrast failure. Fix it by moving the failed colour in
small steps, not by weakening the target, and note the change in the mood
line. Run it again until there are no failures. Warnings (90-8-2, tinted
neutrals, muted states) do not block: show them to the creator, because the
style can choose to go against them. Then open
`design/palettes.html` in the browser (`open` on macOS, `xdg-open` on Linux)
and ask the creator to pick one. With mode Both, the preview shows light and
dark side by side.

## 7. Keep the other palettes?

"Keep the other 4 palettes as colour presets?" Yes (default) writes them to
`styles/colors/<slug>.json`. The merchant can then switch in Appearance →
Editor → Styles → Colors → Palette. No → only the chosen palette ships.
Set `default` and `keep` in `design/palettes.json`.

## 8. Pages to override

multiSelect, every option checked by default. Tell the creator that all are
selected and that they can deselect any:

Shop · Product details · Cart · Drawer cart · Checkout · Thank you
(order success) · Order failed · Account pages

AskUserQuestion has at most 4 options per question, so ask it as two
multiSelect questions (Shop / Product details / Cart / Drawer cart, then
Checkout / Thank you / Order failed / Account), and say in each question
that all are on by default. A page that is not selected keeps the plugin's
view and gets only the theme tokens.

## 8a. Page layouts

Read `layouts.md`. Ask one question per selected prime page (Shop, Product
details, Cart, Drawer cart, Checkout), each with 3 options: 2 catalogue
archetypes and 1 composed layout, every option with an ASCII preview. Record
the chosen spec for each page, and the derived specs for Thank you, Order
failed and Account (`layouts.md` §6).

## 9. Typography

Read `design-rules.md` → Typography and `ui-ux-pro-max.md` §5. Offer 3
pairings from ui-ux-pro-max: the `--design-system` pairing first
(recommended), then the best matches of the typography search. Remove each
pairing that has a font without a GPL-compatible licence, and take the next.
Say in one line why each fits the style.

## 10. Product photos

Two questions:

1. Style: **Studio cutout** (neutral background, product only) or
   **Lifestyle** (model or scene). Recommend from the niche: apparel and
   beauty → studio cutout for the grid, lifestyle for hero and editorial;
   home and living → lifestyle.
2. Ratio: **4:5** (default for apparel), **1:1** (beauty, accessories, small
   goods), **3:4** (luxury, editorial), **16:9** (only for hero and banners,
   never for the product grid). Recommend from the niche and style.

## After the last answer

Show a short summary of all decisions and ask "Write the plan?" with the
options "Write plan (Recommended)" and "Change an answer".
