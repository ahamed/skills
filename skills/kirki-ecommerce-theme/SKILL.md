---
name: kirki-ecommerce-theme
description: Plan and build a modern, accessible WordPress block theme (FSE, theme.json v3, WordPress 6.8+) for a store that runs on the Kirki eCommerce plugin, with its own shop, product, cart, drawer cart, checkout, thank-you, order-failed and account pages. Uses the ui-ux-pro-max skill (installs it when missing) to offer the top target styles, palettes and fonts, and offers unique per-page layouts (shop, product, cart, drawer cart, checkout) with ASCII previews, so themes differ in layout and not only in colour. Asks about the niche, style, name, colour mode, palettes, pages, layouts, fonts and photo style, previews 5 accessible palettes, writes a module-by-module plan.md, then builds one module per call, including a clean screenshot.png thumbnail. Use this whenever someone wants to create, design, scaffold or continue a Kirki eCommerce theme, a store or shop theme for Kirki eCommerce, a "theme like Seher", or runs `/kirki-ecommerce-theme` or `/kirki-ecommerce-theme build`, even if they only say "make me a shop theme" in a project with Kirki eCommerce installed.
---

# Kirki eCommerce theme builder

This skill makes a modern WordPress **block theme** for a store on
**Kirki eCommerce** (never call the plugin just "Kirki": that is a different
product). Block themes only: no classic PHP templates, no Customizer, no
page builders.

The work has two phases, because a full store theme is too large for one
session (the account pages alone are about 25 views). A long single run gets
compacted, loses small decisions, and spreads one design mistake to every
page. So:

1. **Plan** (`/kirki-ecommerce-theme`): ask the questions, preview the
   palettes, write the theme folder with `design/palettes.json` and
   `plan.md`. Then stop.
2. **Build** (`/kirki-ecommerce-theme build [module …]`): read `plan.md`,
   build the next open module (or the named ones), run the checks, tick the
   module, write a log entry. Then stop, so the creator can look at it.

`plan.md` is the only memory between sessions. Anything decided while
building goes into its Log, so the next session can continue without the chat.

## Reference files

Read each one when the step says so; do not load all of them up front.

| File | Read it for |
|---|---|
| `references/discovery.md` | The questions, their order, options and defaults |
| `references/ui-ux-pro-max.md` | Installing ui-ux-pro-max, the style shortlist, colour and font mapping, the hard limits |
| `references/layouts.md` | The layout catalogue per prime page, the composed layout, the spec format, layout UX rules |
| `references/color-system.md` | The default 90-8-2 colour rules (warnings), tokens, palette generator, dark mode |
| `references/design-rules.md` | 4-point spacing, typography pairings, photos, motion, layout, clean code |
| `references/tech-stack.md` | Stack, folder layout, config files, PHP and front-end conventions |
| `references/kirki-ecommerce.md` | View overrides, page → view list, drawer cart, script hooks, `--kecom-*` map, version check |
| `references/thumbnail.md` | The theme thumbnail (`screenshot.png`) for Appearance → Themes |
| `references/plan-template.md` | The `plan.md` to write |
| `scripts/palettes.mjs` | Derives and checks palettes; writes theme.json, colour presets, dark CSS, the HTML preview |
| `scripts/parity.mjs`, `scripts/parity-update.mjs` | The view parity record and test helpers |

## Phase 1: Plan

1. **Look around.** Find the WordPress root (`wp-config.php`) and the
   Kirki eCommerce plugin (`wp-content/plugins/kirki-ecommerce/kirki-ecommerce.php`):
   its version and its `resources/views/site/` list. If the working
   directory already has a theme with a `plan.md` from this skill, ask whether
   to continue it (go to Phase 2) or start a new one.
   **Make sure `ui-ux-pro-max` is installed** (`references/ui-ux-pro-max.md`
   §1). If it is missing, install it globally. Do not continue without it.
2. **Ask the questions** in `references/discovery.md`, one at a time, with
   AskUserQuestion. Put your recommendation first, marked "(Recommended)",
   and say in a few words why it fits the answers so far. Read
   `ui-ux-pro-max.md` before the style step, `color-system.md` before the
   palette step, `layouts.md` before the layout step, and `design-rules.md`
   before the typography and photo steps.
   The target style (step 2) and the page layouts (step 8a) are the two
   decisions that make the theme its own. Never skip them, and never offer
   only the plugin's current layout.
3. **Palettes.** Write 5 palettes to `<theme>/design/palettes.json`, copy
   `scripts/palettes.mjs` into `<theme>/scripts/`, run
   `node <theme>/scripts/palettes.mjs preview --dir <theme>`, fix every
   failure by changing the inputs, and open `design/palettes.html` for the
   creator. With mode Both, the preview shows light and dark side by side.
4. **Write the plan.** Fill `references/plan-template.md` into
   `<theme>/plan.md`: decisions, a short design brief, the chosen layout
   specs, and only the modules for the selected pages. Do not create other theme files yet; the starter
   module does that.
5. **Stop.** Tell the creator where the plan is, give a 5-line summary,
   and say: "Run `/kirki-ecommerce-theme build` to build the first module
   (starter)."

## Phase 2: Build

1. **Load the plan.** Find `plan.md` (the working directory, or the theme
   folder the creator names). Pick the modules: the names in the arguments,
   or the first `[ ]` row. A module whose earlier modules are open: build the
   earlier ones first, unless the creator asked for this one on purpose.
2. **Read only what the module needs**: its section in `plan.md`, the
   Decisions, the Design brief, its layout spec (Layouts), the Log,
   `design/design-system/<slug>/MASTER.md`, and the reference files it
   points to. Read the theme code that the module touches, and for a store page, the
   plugin views it overrides (from the plugin folder, current version).
3. **Build it.**
   - Follow the rules in the references: tokens only (no raw colours, every
     space a 4-point token), role tokens with the theme prefix, the style in
     `MASTER.md`, minimal motion with a reduced-motion path, accessible
     markup (labels, focus, 44px targets, 4.5:1 text).
   - Store pages: copy the plugin view, keep its data, fields, Alpine
     components, events and every `kecom-` class, add the `<prefix>-` twin
     classes, then **restructure the markup to the layout spec**. A page that
     looks like the plugin page with new colours is not done. Run
     `npm run parity:update` after each copy.
   - Write clean, minimal code: only what the module needs, no unused
     tokens or options, comments that say why.
   - Write tests for each TS component's logic (pure functions, no DOM).
4. **Check** in the theme folder: `npm run build`, `npm run typecheck`,
   `npm run lint`, `npm test`, `npm run palettes:check`, and
   `npm run lint:php` for PHP changes. Also the 4-point grep in
   `design-rules.md` §1. Fix what fails. Say plainly if a check could not run.
5. **Record.** Tick the module in the status table and add a Log entry:
   date, what was built, decisions taken while building (with the reason),
   open items, check results.
6. **Stop.** Tell the creator what to look at in the browser (which pages,
   which states: empty cart, error, mobile width, dark mode, reduced motion),
   and the next command (`/kirki-ecommerce-theme build`). Do not start the
   next module. Building two small modules in one call is fine only when the
   creator names both.

## Rules that hold in every phase

- **Style, colours and fonts** come from ui-ux-pro-max and win over this
  skill's defaults. The hard limits (`ui-ux-pro-max.md` §5) still hold:
  WCAG contrast (the generator fails on it: never weaken the targets),
  GPL-compatible self-hosted fonts, the accessibility rules, and the plugin
  view contract. The 90-8-2 rules in `color-system.md` are the default and
  only warn.
- **Layouts** follow the chosen specs in `plan.md` → Layouts and the UX rules
  in `layouts.md` §5.
- **Tokens**: `--<prefix>-bg-canvas`, `--<prefix>-text-primary`,
  `--<prefix>-accent-primary`, `--<prefix>-space-4` … as listed in the
  references. Components never use `--wp--*` names or raw values directly.
- **No stored data** that WordPress does not already store: palettes are
  colour variations, the scheme choice is the shopper's localStorage.
- **Kirki eCommerce** is read, never edited. Feature-detect each hook and
  keep the plugin's default when it is missing.
- **Modern WordPress only**: block theme, theme.json v3, WordPress 6.8+,
  PHP 7.4+.
- Do not commit, push or publish unless the creator asks.
